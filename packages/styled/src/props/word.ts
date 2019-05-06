import * as Css from "csstype"
import {cssStyle} from "../styled"

export interface Word {
  readonly wordWrap?: Css.Properties["wordWrap"]
  readonly wordBreak?: Css.Properties["wordBreak"]
  readonly wordSpacing?: Css.Properties["wordSpacing"]
}

export default cssStyle<Word>("wordWrap", "wordBreak", "wordSpacing")
