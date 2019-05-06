import {styled, css} from "../styled"

export interface NoSelect {
  readonly noselect?: boolean
}

export default styled(({noselect}: NoSelect) =>
  noselect
    ? css({
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "-khtml-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none"
      })
    : css({})
)
