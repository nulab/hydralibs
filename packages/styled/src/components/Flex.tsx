import Box from "./Box"
import * as Css from "csstype"
import {numToPx, responsive} from "../style"
import {styled, css} from "../styled"
import {Overflow} from "../props/overflow"
import {Option} from "functools-ts"

/** 
 * Using these manual type definitions 
 * to make typing stronger than found in csstype: 
 * https://github.com/frenic/csstype/issues/8
*/
type SelfPosition =
  | "center"
  | "end"
  | "flex-end"
  | "flex-start"
  | "self-end"
  | "self-start"
  | "start"

type ContentDistribution =
  | "space-around"
  | "space-between"
  | "space-evenly"
  | "stretch"

type ContentPosition = "center" | "end" | "flex-end" | "flex-start" | "start"

type JustifyContent =
  | ContentDistribution
  | ContentPosition
  | "left"
  | "normal"
  | "right"

export type FlexProps = Partial<{
  wrap: Css.Properties["flexWrap"]
  direction: Css.Properties["flexDirection"]
  alignItems: SelfPosition
  justifyContent: JustifyContent
}>

export const Flex = styled(
  Box,
  css({display: "flex", flexShrink: 0}),
  (props: FlexProps) =>
    css(
      responsive(props, {
        wrap: (val: FlexProps["wrap"]) => ({flexWrap: val}),
        direction: (val: FlexProps["direction"]) => ({flexDirection: val}),
        alignItems: (val: FlexProps["alignItems"]) => ({alignItems: val}),
        justifyContent: (val: FlexProps["justifyContent"]) => ({
          justifyContent: val
        })
      })
    )
)

export const Row = styled(
  Flex,
  {direction: "row"},
  (props: {scroll: boolean}): Overflow => ({
    overflowX: props.scroll ? "auto" : "visible"
  }),
  (props: {gap: number | string}) =>
    Option.isDefined(props.gap)
      ? css({
          "& > *:not(:last-child)": {
            marginRight: numToPx(props.gap)
          }
        })
      : css({}),
  (props: {separator: string}) =>
    Option.isDefined(props.separator)
      ? css({
          "& > :not(:last-child)": {
            borderRight: props.separator
          }
        })
      : css({}),
  (props: {hoverColor: string}) =>
    Option.isDefined(props.hoverColor)
      ? css({
          "&:hover": {
            backgroundColor: props.hoverColor
          }
        })
      : css({})
).withDefaults({label: "row"})

export const Col = styled(
  Flex,
  {direction: "column"},
  (props: {scroll: boolean}): Overflow => ({
    overflowY: props.scroll ? "auto" : "visible"
  }),
  (props: {gap: number | string}) =>
    Option.isDefined(props.gap)
      ? css({
          "& > *:not(:last-child)": {
            marginBottom: numToPx(props.gap)
          }
        })
      : css({}),
  (props: {separator: string}) =>
    Option.isDefined(props.separator)
      ? css({
          "& > :not(:last-child)": {
            borderBottom: props.separator
          }
        })
      : css({})
).withDefaults({label: "col"})
