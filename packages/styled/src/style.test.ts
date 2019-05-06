import {css, responsive, styled} from "./styled"
import {computeStyles, numToPx} from "./style"
import {optimize} from "./optimizer"
import expect from "expect"
import border from "./props/border"
import {FlexProps} from "./components/Flex"
import overflow, {Overflow} from "./props/overflow"

const compute = (styles: any[], tagProps: any = {}) => {
  const optimized = optimize(styles)
  const css = computeStyles(optimized.styles, tagProps, {})
  return css
}

describe("core/styled", () => {
  it("handles plain css", () => {
    expect(compute([css({backgroundColor: "blue"})])).toEqual({
      backgroundColor: "blue"
    })
  })

  it("handles plain css returned from functions", () => {
    expect(
      compute([
        css({width: "100px"}),
        (_: {}) => css({backgroundColor: "blue"})
      ])
    ).toEqual({
      width: "100px",
      backgroundColor: "blue"
    })
  })

  it("transforms props to css", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          bg: "blue"
        }
      ])
    ).toEqual({
      backgroundColor: "blue"
    })
  })

  it("ignores undefined props", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          bg: "blue",
          col: "red"
        }
      ])
    ).toEqual({
      backgroundColor: "blue"
    })
  })

  it("ignores props defined later", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          bg: "blue",
          col: "red"
        },
        (props: any) => css({color: props.col})
      ])
    ).toEqual({
      backgroundColor: "blue"
    })
  })

  it("converts pseudo props", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          $hover: {bg: "green"}
        }
      ])
    ).toEqual({
      "&:hover": {backgroundColor: "green"}
    })
  })

  it("converts pseudo props with multiple child properties", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg, color: props.col}),
        {
          $hover: {bg: "green", col: "blue"}
        }
      ])
    ).toEqual({
      "&:hover": {backgroundColor: "green", color: "blue"}
    })
  })

  it("ignores pseudo-prop props defined later", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          $hover: {bg: "green", col: "blue"}
        },
        (props: any) => css({color: props.col})
      ])
    ).toEqual({
      "&:hover": {backgroundColor: "green"}
    })
  })

  it("converts nested pseudo props", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          $hover: {$after: {bg: "green"}}
        }
      ])
    ).toEqual({
      "&:hover": {
        "&:after": {backgroundColor: "green"}
      }
    })
  })

  it("converts nested pseudo props (complex)", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        (props: any) => ({bg: props.bag}),
        {
          bag: "blue",
          $hover: {bag: "yellow", $after: {bag: "green"}}
        }
      ])
    ).toEqual({
      backgroundColor: "blue",
      "&:hover": {
        backgroundColor: "yellow",
        "&:after": {backgroundColor: "green"}
      }
    })
  })

  it("newer props take precendence over older props", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {bg: "green"},
        {bg: "blue"}
      ])
    ).toEqual({
      backgroundColor: "blue"
    })
  })

  it("newer props take precendence over older props when nested", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg}),
        {
          $hover: {$after: {bg: "green"}}
        },
        {
          $hover: {$after: {bg: "blue"}}
        }
      ])
    ).toEqual({
      "&:hover": {
        "&:after": {backgroundColor: "blue"}
      }
    })
  })

  it("all-in-one", () => {
    expect(
      compute([
        (props: any) => css({backgroundColor: props.bg, color: props.col}),
        {
          radius: "this should be excluded",
          $hover: {
            undefinedProp: "this should be excluded",
            $after: {
              radius: "this should be excluded",
              bg: "green"
            }
          }
        },
        (props: any) => css({borderRadius: numToPx(props.radius)}),
        {
          radius: 10,
          $hover: {$after: {bg: "blue"}, radius: 3}
        },
        {
          $hover: {radius: 5}
        }
      ])
    ).toEqual({
      borderRadius: "10px",
      "&:hover": {
        borderRadius: "5px",
        "&:after": {
          backgroundColor: "blue"
        }
      }
    })
  })

  it("box sample", () => {
    const Flex = styled(
      border,
      overflow,
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
    const Row = styled(
      Flex,
      {direction: "row"},
      (props: {scroll: boolean}): Overflow => ({
        overflowX: props.scroll ? "auto" : "visible"
      })
    )
    const cssObj = computeStyles(Row.__styles, {scroll: true}, {})
    expect(cssObj).toEqual({
      display: "flex",
      flexDirection: "row",
      flexShrink: 0,
      overflowX: "auto"
    })
  })
})
