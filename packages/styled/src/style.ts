import {StyledArg, DefaultTag, isBoxedCss, BoxedCSSObject} from "./types"
import {List, F1, Option} from "functools-ts"
import isFunction from "lodash-es/isFunction"
import {CSSObject} from "@emotion/core"
import {CSSInterpolation} from "./types"
import * as fastextend from "fastextend"
import kebabCase from "lodash-es/kebabCase"

export const num = (n: any): n is number => typeof n === "number" && !isNaN(n)

export const numToPx = (n?: number | string) =>
  Option.isDefined(n) ? (num(n) ? `${n}px` : n) : undefined

const omitEmptyValues = (obj: CSSObject): CSSObject => {
  let filteredObj: any = {}
  if (Object.keys(obj).length === 0) return obj
  for (const key in obj) {
    if ((obj as Object).hasOwnProperty(key) && Option.isDefined(obj[key]))
      filteredObj[key] = obj[key]
  }
  return filteredObj
}

export const fastPick = <A extends {}>(
  obj: A,
  ...keys: (keyof A)[]
): Partial<A> => {
  let filteredObj: Partial<A> = {}
  const length = keys.length
  for (let i = 0; i < length; ++i)
    if (Option.isDefined(obj[keys[i]])) filteredObj[keys[i]] = obj[keys[i]]
  return filteredObj
}

export const cssStyle = <P extends {}>(
  ...keys: (keyof P)[]
): F1<P, CSSInterpolation<any>> => (props: P) =>
  BoxedCSSObject(fastPick(props, ...keys) as any)

const filterTagProps = (props: any): any =>
  Object.keys(props).reduce(
    (acc, key) => {
      if (key !== "children" && typeof props[key] !== "function")
        acc[key] = props[key]
      return acc
    },
    {} as any
  )

export const computeCssOnly = (
  styles: List<StyledArg<{}, {}, DefaultTag>>,
  tagProps: any,
  defaults__depreciated?: any
): CSSObject => {
  let cssObjs: CSSObject[] = []
  let collectedProps = fastextend.merge(
    {},
    defaults__depreciated,
    filterTagProps(tagProps)
  )
  const totalStyles = styles.length
  for (let i = 0; i < totalStyles; ++i) {
    const style = isFunction(styles[i])
      ? (styles[i] as any)(collectedProps)
      : styles[i]
    if (isBoxedCss(style)) {
      cssObjs.push(style.__css)
    } else {
      collectedProps = fastextend.merge(collectedProps, style)
    }
  }
  return fastextend.merge({}, ...cssObjs)
}

export const computeStyles = (
  allStyles: List<StyledArg<{}, {}, DefaultTag>>,
  tagProps: any,
  defaults__depreciated?: any
): CSSObject => {
  let cssObj: CSSObject = {}
  let collectedProps = fastextend.merge(
    {},
    defaults__depreciated,
    filterTagProps(tagProps)
  )

  // Collect style props and run through style funcs to compute cssObj
  const numStyles = allStyles.length
  for (let i = 0; i < numStyles; ++i) {
    const style = allStyles[i]
    if (isFunction(style)) {
      const result = transformProps(style, collectedProps)
      cssObj = fastextend.merge(result.css, cssObj)
      collectedProps = fastextend.merge(result.props, collectedProps)
    } else {
      if (isBoxedCss(style)) {
        cssObj = fastextend.merge({}, style.__css, cssObj)
      } else {
        collectedProps = fastextend.merge({}, style, collectedProps)
      }
    }
  }
  return computePseudoProps(cssObj, collectedProps)
}

const computePseudoProps = (
  cssObj: CSSObject,
  collectedProps: any
): CSSObject => {
  return fastextend.merge(cssObj, pseudoPropsToCss(collectedProps))
}

interface PropsAndCss {
  type: "PropsAndCss"
  props: any
  css: CSSObject
}
const PropsAndCss = (props: any, css: CSSObject = {}): PropsAndCss => ({
  type: "PropsAndCss",
  props,
  css
})

const isPropsAndCss = (obj: any): obj is PropsAndCss =>
  obj && obj.type && obj.type === "PropsAndCss"

const transformProps = (styleFn: any, props: any): PropsAndCss => {
  const styleFnResult = styleFn(props)
  const transformedProps = isBoxedCss(styleFnResult)
    ? BoxedCSSObject(omitEmptyValues(styleFnResult.__css))
    : omitEmptyValues(styleFnResult)
  const result: PropsAndCss = isBoxedCss(transformedProps)
    ? PropsAndCss({}, transformedProps.__css)
    : PropsAndCss(fastextend.merge({}, props, transformedProps))
  for (let propName in props) {
    if (propName[0] === "$") {
      const pseudoProp = props[propName]
      if (!isBoxedCss(pseudoProp)) {
        const transformedPseudoProp = transformProps(
          styleFn,
          isPropsAndCss(pseudoProp) ? pseudoProp.props : pseudoProp
        )
        result.props[propName] = fastextend.merge(
          transformedPseudoProp,
          isPropsAndCss(pseudoProp) ? pseudoProp : PropsAndCss(pseudoProp)
        )
      }
    }
  }
  return result
}

const pseudoPropsToCss = (props: any): CSSObject => {
  const cssObj: CSSObject = {}
  for (let propName in props) {
    if (propName[0] === "$") {
      const pseudoProp = props[propName]
      cssObj[`&:${kebabCase(propName.slice(1))}`] = isBoxedCss(pseudoProp)
        ? pseudoProp.__css
        : fastextend.merge(pseudoProp.css, pseudoPropsToCss(pseudoProp.props))
    }
  }
  return cssObj
}

export const responsive = function<T>(
  props: T,
  mappers: {[P in keyof T]: (val: T[P]) => CSSObject},
  ...precedence: (keyof T)[]
): CSSObject {
  const keys = Object.keys(mappers) as (keyof T)[]
  keys.sort((a: keyof T, b: keyof T) =>
    precedence.indexOf(a) > precedence.indexOf(b)
      ? 1
      : precedence.indexOf(a) === precedence.indexOf(b)
      ? 0
      : -1
  )
  return keys.reduce(
    (result, key) =>
      Option.isDefined(props[key])
        ? {...result, ...withMediaQueries(props[key], mappers[key])}
        : result,
    {} as CSSObject
  )
}

const withMediaQueries = function<T>(val: T | T[], fn: (val: T) => CSSObject) {
  if (Array.isArray(val)) {
    const vals = val.slice()
    while (vals.length < 3) {
      vals.push(vals[vals.length - 1])
    }
    return {
      "@media (max-width:480px)": fn(vals[0]),
      "@media (min-width:480px)": fn(vals[1]),
      "@media (min-width:992px)": fn(vals[2])
    }
  } else {
    return fn(val)
  }
}
