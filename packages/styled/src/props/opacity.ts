import * as Css from "csstype"
import {cssStyle} from "../styled"

export interface Opacity {
  opacity?: Css.Properties["opacity"]
}

export default cssStyle<Opacity>("opacity")
