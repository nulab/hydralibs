import * as Css from "csstype"
import {styled, css} from "../styled"
import {numToPx} from "../style"

export type FlexChild = {
  readonly order: Css.Properties["order"]
  readonly alignSelf: Css.Properties["alignSelf"]
  readonly grow: Css.Properties["flexGrow"]
  readonly shrink: Css.Properties["flexShrink"]
  readonly basis: Css.Properties["width"] | number
}

export default styled(({order, alignSelf, grow, shrink, basis}: FlexChild) =>
  css({
    order,
    alignSelf,
    flexGrow: grow,
    flexShrink: shrink,
    flexBasis: numToPx(basis),
  })
)
