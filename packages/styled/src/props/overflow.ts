import * as Css from "csstype"
import {cssStyle} from "../style"

export interface Overflow {
  overflow?: Css.Properties["overflow"]
  overflowX?: Css.Properties["overflowX"]
  overflowY?: Css.Properties["overflowY"]
  textOverflow?: Css.Properties["textOverflow"]
}

export default cssStyle<Overflow>(
  "overflow",
  "overflowX",
  "overflowY",
  "textOverflow"
)
