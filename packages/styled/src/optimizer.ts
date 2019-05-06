import {List} from "functools-ts"
import {StyledArg, DefaultTag, isStyledComponent} from "./types"
import merge from "lodash-es/merge"
import reverse from "lodash-es/reverse"

type Styles = List<StyledArg<{}, {}, DefaultTag>>

interface OptimizedStyled {
  styles: Styles
  defaults: {}
}

export const optimize = (styles: Styles): OptimizedStyled => {
  const optimizedStyled: OptimizedStyled = {
    styles: [],
    defaults: {}
  }
  const reversedStyles = reverse([...styles])
  return reversedStyles.reduce((acc, style) => {
    if (isStyledComponent(style))
      return {
        defaults: merge(acc.defaults, style.__defaults),
        styles: [...acc.styles, ...style.__styles]
      }
    return {
      defaults: acc.defaults,
      styles: [...acc.styles, style]
    }
  }, optimizedStyled)
}
