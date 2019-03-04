import {Dispatch} from "hydra-dispatch"

import {createBrowserHistory, createMemoryHistory} from "history"

type Env = "Nodejs" | "Browser"

const env = (): Env =>
  typeof window !== "undefined" && typeof window.document !== "undefined"
    ? "Browser"
    : "Nodejs"

const history =
  env() === "Browser" ? createBrowserHistory() : createMemoryHistory()

// Subtract the baseUri from window.location.pathname
const getPath = (baseUri = "") => {
  if (baseUri) baseUri += "/"
  const path = window.location.pathname + window.location.search
  return path
    .slice(1)
    .split("")
    .reduce((result, char, i) => result + (char === baseUri[i] ? "" : char), "")
}

export const SetRouteType = "SetRoute"

export type SetRouteOpts = {
  pop?: boolean
  replace?: boolean
}

export type RouteToUri<Route> = (route: Route) => string
export type UriToRoute<Route> = (uri: string) => Route

export const buildSetRoute = <Route>(
  routeToUri: RouteToUri<Route>,
  dispatch: Dispatch<Route>,
  baseUri: string = ""
) => {
  return (route: Route, opts: SetRouteOpts = {}) =>
    dispatch((_: Route) => {
      if (!opts.pop) {
        const historyAction = opts.replace ? history.replace : history.push
        historyAction(`/${baseUri ? baseUri + "/" : ""}${routeToUri(route)}`)
      }
      return route
    }, SetRouteType)
}

export const load = <Route>(
  dispatch: Dispatch<Route>,
  uriToRoute: UriToRoute<Route>,
  routeToUri: RouteToUri<Route>,
  baseUri = "",
  isHotReloading = false
) => {
  const setRoute = buildSetRoute(routeToUri, dispatch, baseUri)
  if (!isHotReloading && !(window as any).IS_CORDOVA)
    setRoute(uriToRoute(getPath(baseUri)))
  return history.listen((_, action) => {
    if (action === "POP") setRoute(uriToRoute(getPath(baseUri)), {pop: true})
  })
}

export interface State<Route> {
  route: Route
}

export type SetRoute<Route> = (route: Route, opts?: SetRouteOpts) => void

export type Router<Route> = {
  setRoute: SetRoute<Route>
}
