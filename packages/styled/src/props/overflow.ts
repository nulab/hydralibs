import * as Css from "csstype"
import {cssStyle} from "../styled"

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
