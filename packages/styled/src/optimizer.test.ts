import {styled, css} from "./styled"
import {expect} from "chai"

describe("core/styled/optimizer", () => {
  const styledParagraph = styled(css({backgroundColor: "blue"})).withTag("p")
  const styledDiv = styled(
    styledParagraph,
    css({width: "100px"}),
    (_: {}) => css({height: "200px"}),
    css({margin: "0"})
  )

  it("should optimized styled component pipeline", () => {
    expect(styledParagraph.__styles.length).eql(1)
  })

  it("styles size should be 3", () => {
    expect(styledDiv.__styles.length).eql(4)
    expect(typeof styledDiv.__styles[1]).eql("function")
  })
})
