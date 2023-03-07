import {
  StyledArg,
  Tag,
  StyledComponent,
  StyledFn,
  DefaultTag,
  hasCSSTransitions,
  BoxedCSSObject,
  Props as $Props
} from "./types"
import React, {Component as ReactComponent} from "react"
import {optimize} from "./optimizer"
import {List, Option, compose} from "functools-ts"
import merge from "lodash-es/merge"
import {computeStyles, fastPick, computeCssOnly} from "./style"
import {CSSTransitionProps} from "react-transition-group/CSSTransition"
import isEmpty from "lodash-es/isEmpty"
import omit from "lodash-es/omit"
import identity from "lodash-es/identity"
import {shallowEqual} from "fast-equals"
import {css as emotionCss} from "emotion"
import * as HTMLElementAttrs from "react-html-attributes"
import {CSSTransition} from "react-transition-group"
import {CSSObject} from "@emotion/core"

export const css = BoxedCSSObject

export const styled = ((<P, T extends Tag = DefaultTag>(
  ...styles: StyledArg<{}, {}, T>[]
) => {
  const optimized = optimize(styles)
  const genComponent = <U extends Tag>(
    stylesF: List<StyledArg<{}, {}, Tag>>,
    defaults?: Partial<P>,
    tag?: U
  ) => {
    type Props = $Props<P, U>
    const component = (class ReactStyledComponent2 extends ReactComponent<
    Props
    > {
      private className: string
      private tag: U
      private transitionOn: Option<List<string>> = null
      private transitionProps: Option<CSSTransitionProps> = null
      private domEl: any
      private didFocus: boolean
      private style: CSSObject
      private initialStyle: CSSObject
      private mounted: boolean
      private refHandler: Function

      private extractStyleProps(props: Props): Partial<Props> {
        let styleProps: any = {}
        for (const key in props) {
          if (
            Option.isDefined((props as any)[key]) &&
            typeof (props as any)[key] !== "function" &&
            key[0] !== "$" &&
            key !== "children"
          )
            styleProps[key] = (props as any)[key]
        }
        return styleProps
      }

      private styleDidChange(nextProps: Props): boolean {
        const currentStyleProps = this.extractStyleProps(this.props as Props)
        const nextStyleProps = this.extractStyleProps(nextProps)
        return shallowEqual(currentStyleProps, nextStyleProps)
      }

      private getTransitionProps(css: CSSObject) {
        const startCss = (css["&:start"] as CSSObject) || {}
        const endCss = (css["&:end"] as CSSObject) || {}
        return {
          classNames: {
            ...(!isEmpty(startCss)
              ? {
                appear: emotionCss(startCss),
                appearActive: emotionCss(
                  fastPick(css, ...Object.keys(startCss))
                )
              }
              : {}),
            ...(!isEmpty(endCss)
              ? {
                exit: emotionCss(endCss),
                exitActive: emotionCss(
                  Object.keys(endCss).reduce(
                    (obj, key) => {
                      obj[key] = css[key]
                      return obj
                    },
                    {} as CSSObject
                  )
                )
              }
              : {})
          },
          in: true,
          timeout:
            css.transitionDuration!.slice(-2) === "ms"
              ? parseInt(css.transitionDuration!.slice(-2) as string, 10)
              : parseInt(css.transitionDuration!.slice(-1) as string, 10) *
                1000,
          appear: true
        }
      }

      private createStyles(props: Props) {
        const css = computeStyles(optimized.styles, props, optimized.defaults)
        this.initialStyle = computeCssOnly(
          optimized.styles,
          props,
          optimized.defaults
        )
        if (hasCSSTransitions(css)) {
          this.transitionOn = Object.keys({
            ...((css["&:start"] as any) || {}),
            ...((css["&:end"] as any) || {})
          })
          this.transitionProps = this.getTransitionProps(css)
          this.className = emotionCss({
            transitionProperty: this.transitionOn.join(", "),
            ...omit(css, "&:start", "&:end")
          })
        } else {
          this.className = emotionCss(omit(css, "transitionDuration"))
        }
      }

      private updateStyles(props: Props) {
        const css = computeCssOnly(optimized.styles, props, optimized.defaults)
        let cssDiff: CSSObject = {}
        for (const key in css) {
          if (key[0] !== "&" && this.initialStyle[key] !== css[key])
            cssDiff[key] = css[key]
        }
        for (const key in this.initialStyle) {
          if (
            Option.isDefined(this.initialStyle[key]) &&
            Option.isEmpty(css[key]) &&
            key[0] !== "&"
          )
            cssDiff[key] = "inherit"
        }
        this.style = cssDiff
      }

      constructor(props: Props) {
        super(props)
        this.tag = (this.props.tag ||
          ReactStyledComponent2.__tag ||
          DefaultTag) as U
        this.createStyles(props)
        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.onMountHandler = this.onMountHandler.bind(this)
        this.onRenderHandler = this.onRenderHandler.bind(this)
        this.setDomEl = this.setDomEl.bind(this)
        this.autoFocus = this.autoFocus.bind(this)
      }

      shouldComponentUpdate(nextProps: Props) {
        if (!this.styleDidChange(nextProps)) {
          this.updateStyles(nextProps)
          return true
        }
        return true
      }

      componentDidMount() {
        if (this.props.onClickOutside) {
          window.addEventListener("click", this.handleClickOutside, true)
          window.addEventListener("blur", this.handleClickOutside, true)
        }
      }

      componentDidUpdate(prevProps: Props) {
        if (prevProps.onClickOutside && !this.props.onClickOutside) {
          window.removeEventListener("click", this.handleClickOutside, true)
          window.removeEventListener("blur", this.handleClickOutside, true)
        } else if (!prevProps.onClickOutside && this.props.onClickOutside) {
          window.addEventListener("click", this.handleClickOutside, true)
          window.addEventListener("blur", this.handleClickOutside, true)
        }
      }

      componentWillUnmount() {
        this.mounted = false
        if (this.props.onClickOutside) {
          window.removeEventListener("click", this.handleClickOutside, true)
          window.removeEventListener("blur", this.handleClickOutside, true)
        }
      }

      private handleClickOutside(evt: MouseEvent) {
        const domEl = this.domEl
        if (
          evt.target !== document &&
          evt.target !== window &&
          !!this.props.onClickOutside &&
          (!domEl ||
            (domEl !== evt.target &&
              !(evt.target instanceof Node && domEl.contains(evt.target))))
        ) {
          this.props.onClickOutside(evt)
        }
      }

      private getTagProps() {
        const allowedAttrs = HTMLElementAttrs["*"].concat(
          HTMLElementAttrs[this.tag] || []
        )
        let tagProps: any = {}
        for (const key in this.props) {
          if (key === "focusable" || key === "autoFocus")
            tagProps["tabIndex"] = -1
          const cond =
            allowedAttrs.indexOf(key) >= 0 ||
            (key.startsWith("on") && key[2] === key[2].toUpperCase()) ||
            key.startsWith("data-") ||
            key.startsWith("aria-") ||
            key === "id"
          if (cond) tagProps[key] = (this.props as any)[key]
        }
        return tagProps
      }

      private onMountHandler(el?: HTMLElement) {
        if (el) this.props.onMount!(el)
        return el
      }

      private onRenderHandler(el?: HTMLElement) {
        if (el) this.props.onRender!(el)
        return el
      }

      private setDomEl(el?: HTMLElement) {
        this.domEl = el
        return el
      }

      private autoFocus(el?: HTMLElement) {
        if (el && !this.didFocus) {
          el.focus()
          this.didFocus = true
        }
        return el
      }

      render() {
        const tagPropsWithClassname = this.getTagProps()
        const suppliedClassName = tagPropsWithClassname.className
        const tagProps = omit(
          tagPropsWithClassname,
          "className",
          "onMount",
          "onClickOutside",
          "onRender"
        )
        const className =
          this.className + (suppliedClassName ? " " + suppliedClassName : "")

        const callOnMount = this.props.onMount && !this.mounted

        if (
          !this.refHandler &&
          (callOnMount ||
            this.props.onRender ||
            this.props.onClickOutside ||
            this.props.autoFocus)
        )
          this.refHandler = compose(
            callOnMount ? this.onMountHandler : identity,
            this.props.onRender ? this.onRenderHandler : identity,
            this.props.onClickOutside ? this.setDomEl : identity,
            this.props.autoFocus ? this.autoFocus : identity
          )
        tagProps.ref = this.refHandler
        this.mounted = true

        if (this.transitionProps) {
          const el = React.createElement(
            this.tag,
            {
              className,
              style: this.style,
              ...(tagProps as {})
            },
            this.props.children
          )
          return React.createElement(CSSTransition, this.transitionProps!, el)
        }
        return React.createElement(
          this.tag,
          {
            className,
            style: this.style,
            ...(tagProps as {})
          },
          this.props.children
        )
      }
      static __styles = stylesF
      static __defaults = defaults
      static __tag = tag
      static withDefaults(newDefaults: Partial<P>) {
        return genComponent(stylesF, merge(defaults, newDefaults), tag)
      }
      static withTag<U>(tag: U) {
        return genComponent(stylesF, defaults, tag as any)
      }
    } as any) as StyledComponent<P, T>
    return component
  }
  return genComponent(optimized.styles, optimized.defaults)
}) as any) as StyledFn
