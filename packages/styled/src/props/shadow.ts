import {styled, css} from "../styled"

export interface Shadow {
  readonly shadow?: boolean | string
}

export default styled(({shadow}: Shadow) =>
  css({
    boxShadow:
      shadow === true
        ? "0 4px 7px 2px rgba(0, 0, 0, 0.05)"
        : shadow
        ? shadow
        : undefined,
  })
)
