import {List} from "functools-ts"
import {StyledArg, DefaultTag, isStyledComponent, Tag} from "./types"
import merge from "lodash-es/merge"
import reverse from "lodash-es/reverse"

type Styles<T extends Tag = DefaultTag> = List<StyledArg<{}, {}, T>>

interface OptimizedStyled {
  styles: Styles
  defaults: {}
}

export const optimize = <T extends Tag = DefaultTag>(styles: Styles<T>): OptimizedStyled => {
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
