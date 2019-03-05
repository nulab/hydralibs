# Getting started

At first let's create a new project

```sh
npx hydra-cli new project tutorial
cd tutorial && npm install
```

Then run it

```sh
npm start
```

Go to http://localhost:8008

index.ts

```ts
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
```

bootstrap will setup the router and HMR if you are on development mode
Then pass the view to be rendered
Here we use ReactDOM for rendering but it could a something else

Also we registered some hooks to the application to listen when the application is initialized, when the route change and when an uncaught error happen

Root.tsx

```tsx
import React from "react"
import {Dispatch} from "hydra-dispatch"
import {Route, Index} from "./routes"

export interface State {
  route: Route
}
export const State: State = {
  route: Index
}

interface Props extends State {
  dispatch: Dispatch<State>
}

export const Root = (props: Props): JSX.Element => (
  <p>Hello world</p>
)
```

Here it's the root component of our application this is where we can start
writing our application

One thing to notice is that we have a dispatch property in our props
bootstrap is responsible to give it to the Root component
dispatch here is different from redux, we don't dispatch action but functions. we will cover a bit later

routes.ts

```ts
import {RouteCase, path, noArg} from "hydra-router"
import {List} from "functools-ts"

enum RouteType {
  Index = "Index"
}

export interface Index {
  type: RouteType.Index
}
export const Index: Index = {
  type: RouteType.Index
}

export type Route = Index

export const routes: List<RouteCase<Route>> = [
  path(RouteType.Index, "", noArg(Index), () => "")
]
```

This is where we declare our routes
hydra-router provide a nice typed dsl for parsing url into a route object
For now we only have one route

# Counter App
