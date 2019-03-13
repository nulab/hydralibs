import React from "react"
import {render} from "react-dom"
import {store} from "./store"
import {Root} from "./Root"
import {Provider} from "react-redux"
import {setConfig, hot} from "react-hot-loader"
import "semantic-ui-css/semantic.min.css"

setConfig({
  ignoreSFC: true, // RHL will be __completely__ disabled for SFC
  pureRender: true, // RHL will not change render method
})

const App = hot(module)(
  () =>
    <Provider store={store!}>
      <Root />
    </Provider>
)

render(<App />, document.getElementById("root"))