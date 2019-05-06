import space from "../props/space"
import * as Size from "../props/size"
import color from "../props/color"
import flexChild from "../props/flexChild"
import font from "../props/font"
import border from "../props/border"
import cursor from "../props/cursor"
import label from "../props/label"
import {StyleOf} from "../types"
import {styled, css} from "../styled"
import radius from "../props/radius"
import shadow from "../props/shadow"
import opacity from "../props/opacity"
import transition from "../props/transition"
import noselect from "../props/noselect"
import position from "../props/position"
import overflow from "../props/overflow"
import word from "../props/word"

const Box = styled(
  css({outlineWidth: "0"}),
  space,
  Size.Style,
  color,
  border,
  shadow,
  radius,
  font,
  flexChild,
  cursor,
  label,
  opacity,
  transition,
  noselect,
  position,
  overflow,
  word
).withDefaults({label: "box"})

export type BoxProps = StyleOf<typeof Box>

export default Box
