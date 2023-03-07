import * as Css from "csstype"
import {styled, css} from "../styled"

export interface Color {
  readonly color?: Css.Properties["color"]
  readonly bg?: Css.Properties["backgroundColor"]
}
export default styled(({color, bg}: Color) =>
  css({
    color,
    backgroundColor: bg,
  })
)
