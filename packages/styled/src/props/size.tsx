import * as Css from "csstype"
import {numToPx, responsive} from "../style"
import {styled, css} from "../styled"
import {OneOrMany} from "../types"

export type Val = Css.Properties["width"] | number

export interface Props {
  readonly size?: OneOrMany<Val>
  readonly width?: OneOrMany<Val>
  readonly height?: OneOrMany<Val>
  readonly maxWidth?: OneOrMany<Val>
  readonly maxHeight?: OneOrMany<Val>
  readonly minWidth?: OneOrMany<Val>
  readonly minHeight?: OneOrMany<Val>
}

const toCss = (props: Props) =>
  css(
    responsive(
      props,
      {
        width: (val: Val) => ({width: numToPx(val)}),
        height: (val: Val) => ({height: numToPx(val)}),
        minWidth: (val: Val) => ({minWidth: numToPx(val)}),
        minHeight: (val: Val) => ({minHeight: numToPx(val)}),
        maxWidth: (val: Val) => ({maxWidth: numToPx(val)}),
        maxHeight: (val: Val) => ({maxHeight: numToPx(val)}),
        size: (val: Val) => ({
          width: numToPx(val),
          height: numToPx(val)
        })
      },
      "size"
    )
  )

export const Style = styled((props: Props) => toCss(props))
