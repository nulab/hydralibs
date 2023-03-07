import * as Css from "csstype"
import {styled, css} from "../styled"
import {rem} from "polished"
import {numToPx} from "../style"

export interface Font {
  fontSize?: number
  lineHeight?: Css.Properties["lineHeight"] | number
  textAlign?: Css.Properties["textAlign"]
  bold?: boolean
  italic?: boolean
  whiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap"
}

export default styled((props: Font) =>
  css({
    fontSize: props.fontSize ? rem(props.fontSize) : undefined,
    lineHeight: numToPx(props.lineHeight),
    textAlign: props.textAlign,
    fontWeight: props.bold ? "bold" : undefined,
    fontStyle: props.italic ? "italic" : undefined,
    whiteSpace: props.whiteSpace,
  })
)
