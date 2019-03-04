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
