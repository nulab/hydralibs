import * as Css from "csstype"
import {styled, css} from "../styled"
import {num} from "../style"
import {Option} from "functools-ts"

export interface Transition {
  readonly transitionProperty?: Css.Properties["transitionProperty"] | string
  readonly transitionDelay?: Css.Properties["transitionDelay"] | number
  readonly transitionTime?: Css.Properties["transitionDuration"] | number
  readonly transitionFunc?: Css.Properties["transitionTimingFunction"]
}

export const numToMs = (n?: number | string) =>
  Option.isDefined(n) ? (num(n) ? `${n}ms` : n) : undefined

export default styled((props: Transition) =>
  css({
    transitionProperty: props.transitionProperty,
    transitionDelay: numToMs(props.transitionDelay),
    transitionDuration: numToMs(props.transitionTime),
    transitionTimingFunction: props.transitionFunc,
  })
).withDefaults({transitionTime: 200})
