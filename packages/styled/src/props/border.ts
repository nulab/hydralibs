import * as Css from "csstype"
import {cssStyle} from "../style"

export type Border = Pick<
  Css.Properties,
  "border" | "borderLeft" | "borderRight" | "borderTop" | "borderBottom"
>

export default cssStyle<Border>(
  "border",
  "borderLeft",
  "borderRight",
  "borderTop",
  "borderBottom"
)
