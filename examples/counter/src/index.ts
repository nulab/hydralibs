import {bootstrap} from "../node_modules/hydra-bootstrap/dist"
import {State, Root} from "./Root"
import {routes, Index} from "./routes"
import {render} from "react-dom"

bootstrap(
  State,
  Root,
  routes,
  Index,
  module,
  view => render(view, document.body.firstElementChild),
  {
    onInit: () => console.log("Application initialized"),
    onRouteChanged: state => console.log(`route changed ${state.route}`),
    onError: (_state, err) => console.log(err)
  }
)
