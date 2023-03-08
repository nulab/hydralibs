import * as Css from "csstype"
import {numToPx} from "../style"
import {styled, css} from "../styled"

type Val = Css.Properties["borderRadius"] | number

export interface Radius {
  readonly radius?: Val
}

export default styled(({radius}: Radius) =>
  css({
    borderRadius: numToPx(radius),
  })
)
