# Introduction

Bootstrap your react application quickly

# Motivation

Everytime i created a react-application it was doing the same all over.
I created hydra-bootstrap as a way to get started more quickly by reusing the same base for all my applications

For routing i don't use react-router but a some router i developed in hydra-router.
It is a little bit inspired from fp-ts-routing https://github.com/gcanti/fp-ts-routing

# Getting started

```sh
npm install hydra-bootstrap
```

# Usage

index.ts

```ts
import {bootstrap} from "hydra-bootstrap"
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

Root.tsx

```tsx
import React from "react"
import {Dispatch} from "hydra-dispatch"
import {Route, Index} from "./routes"

export interface State {
  counter: number
  route: Route
}
export const State: State = {
  counter: 0,
  route: Index
}

interface Props extends State {
  dispatch: Dispatch<State>
}

const setCounter = (counter: number) => (state: State): State => ({
  ...state,
  counter
})

export const Root = (props: Props): JSX.Element => (
  <>
    <p>{props.counter}</p>
    <button onClick={() => props.dispatch(setCounter(props.counter - 1))}>
      -
    </button>
    <button onClick={() => props.dispatch(setCounter(props.counter + 1))}>
      +
    </button>
  </>
)
```

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


