import * as Css from "csstype"
import {styled, css, numToPx} from "../styled"

export type Val = Css.Properties["top"] | number

export interface Position {
  position?: Css.Properties["position"]
  zIndex?: Css.Properties["zIndex"]
  top?: Val
  bottom?: Val
  left?: Val
  right?: Val
}

export default styled((props: Position) =>
  css({
    position: props.position,
    zIndex: props.zIndex,
    top: numToPx(props.top),
    bottom: numToPx(props.bottom),
    left: numToPx(props.left),
    right: numToPx(props.right)
  })
)
