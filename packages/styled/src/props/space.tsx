import {styled, css} from "../styled"
import {numToPx, responsive} from "../style"
import {ListProps} from "../types"

type Val = number | string

interface Margin
  extends Readonly<
    ListProps<{
      m?: Val
      mx?: Val
      my?: Val
      ml?: Val
      mr?: Val
      mt?: Val
      mb?: Val
    }>
  > {}

interface Padding
  extends Readonly<
    ListProps<{
      p?: Val
      px?: Val
      py?: Val
      pl?: Val
      pr?: Val
      pt?: Val
      pb?: Val
    }>
  > {}

export interface Space extends Margin, Padding {}

const marginToCss = (props: Margin) =>
  responsive(
    props,
    {
      m: (val: Val) => ({margin: numToPx(val)}),
      mx: (val: Val) => ({marginLeft: numToPx(val), marginRight: numToPx(val)}),
      my: (val: Val) => ({marginTop: numToPx(val), marginBottom: numToPx(val)}),
      ml: (val: Val) => ({marginLeft: numToPx(val)}),
      mr: (val: Val) => ({marginRight: numToPx(val)}),
      mt: (val: Val) => ({marginTop: numToPx(val)}),
      mb: (val: Val) => ({marginBottom: numToPx(val)})
    },
    "m",
    "mx",
    "my",
    "ml",
    "mr",
    "mt",
    "mb"
  )

const paddingToCss = (props: Padding) =>
  responsive(
    props,
    {
      p: (val: Val) => ({padding: numToPx(val)}),
      px: (val: Val) => ({
        paddingLeft: numToPx(val),
        paddingRight: numToPx(val)
      }),
      py: (val: Val) => ({
        paddingTop: numToPx(val),
        paddingBottom: numToPx(val)
      }),
      pl: (val: Val) => ({paddingLeft: numToPx(val)}),
      pr: (val: Val) => ({paddingRight: numToPx(val)}),
      pt: (val: Val) => ({paddingTop: numToPx(val)}),
      pb: (val: Val) => ({paddingBottom: numToPx(val)})
    },
    "p",
    "px",
    "py",
    "pl",
    "pr",
    "pt",
    "pb"
  )

export default styled((props: Space) =>
  css({
    ...marginToCss(props),
    ...paddingToCss(props)
  })
)
