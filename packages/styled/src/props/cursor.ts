import * as Css from "csstype"
import {cssStyle} from "../style"

export interface Cursor {
  cursor?: Css.Properties["cursor"]
}

export default cssStyle<Cursor>("cursor")
