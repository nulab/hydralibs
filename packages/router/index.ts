import {
  F1,
  Either,
  F2,
  Option,
  pipe,
  Left,
  Right,
  F3,
  F4,
  F5,
  List
} from "functools-ts"
import last from "lodash-es/last"
import dropRight from "lodash-es/dropRight"
import Path from "path-parser"

type Dict = {
  [key: string]: string
}

const parseNumber = (numStr: string): Either<string, number> => {
  const res = parseInt(numStr, 10)
  return Number.isNaN(res) ? Left(`cannot parse number ${numStr}`) : Right(res)
}

// const parseDate = (dateStr: string): Either<string, Date> => {
//   const res = dateutils.parseDate(dateStr)
//   return Number.isNaN(res.getTime())
//     ? Left(`cannot parse date ${dateStr}`)
//     : Right(res)
// }

export type RouteCase<Route> = {
  type: string
  path: Path
  parse: Parse<Route>
  format: Format<Route>
}

export type Parse<A> = F1<Dict, Either<string, A>>
export type Format<A> = F2<A, Path, string>
type Parser<A> = F1<string, Parse<A>>

interface MultipleArgFn {
  <A, B>(a: Parse<A>, f: F1<A, B>): Parse<B>
  <A, B, C>(a: Parse<A>, b: Parse<B>, f: F2<A, B, C>): Parse<C>
  <A, B, C, D>(a: Parse<A>, b: Parse<B>, c: Parse<C>, f: F3<A, B, C, D>): Parse<
    D
  >
  <A, B, C, D, E>(
    a: Parse<A>,
    b: Parse<B>,
    c: Parse<C>,
    d: Parse<D>,
    f: F4<A, B, C, D, E>
  ): Parse<E>
  <A, B, C, D, E, G>(
    a: Parse<A>,
    b: Parse<B>,
    c: Parse<C>,
    d: Parse<D>,
    e: Parse<E>,
    f: F5<A, B, C, D, E, G>
  ): Parse<G>
}

const isPath = (path: Path | string): path is Path => (path as any).test != null
const pathLength = (path: Path | string): number =>
  isPath(path) ? path.source.length : path.length

const multipleArg: MultipleArgFn = (...parseArgFns: any[]) => (input: Dict) => {
  const apply = last(parseArgFns)
  const parseFns = dropRight(parseArgFns, 1)
  const result = Either.sequence(
    parseFns.map(parseArgFn => parseArgFn(input))
  ) as Either<string, List<any>>
  return Either.map(result, args => apply(...args))
}

export const routeCase = <Route>(
  type: string,
  path: string,
  parse: Parse<Route>,
  format: Format<Route>
): RouteCase<Route> => ({
  type,
  path: new Path(path || "/"),
  parse,
  format
})

export const noArg = <A>(value: A): Parse<A> => _ => Right(value)
export const stringArg = (field: string): Parse<string> => dict => {
  const res = pipe(
    dict[field],
    maybeField => Option.map(maybeField, Right),
    maybeField => Option.getOrElse(maybeField, () => Left("empty value"))
  )
  return res as Either<string, string>
}
export const numberArg = (field: string): Parse<number> => dict => {
  return pipe(
    stringArg(field)(dict),
    result => Either.flatMap(result, parseNumber)
  )
}
// export const dateArg = (field: string): Parse<Date> => dict => {
//   return pipe(
//     stringArg(field)(dict),
//     result => Either.flatMap(result, parseDate)
//   )
// }
export const optionalArg = <A>(
  field: string,
  parserFactory: Parser<A>
): Parse<Option<A>> => dict =>
  Option.isDefined(dict[field]) ? parserFactory(field)(dict) : Right(undefined)
export const args = multipleArg
export const path = <Route>(
  type: string,
  path: string,
  parse: Parse<Route>,
  format: Format<Route>
): RouteCase<Route> => routeCase(type, path, parse, format)
export const parse = <Route>(
  uri: string,
  notFound: Route,
  routeCases: List<RouteCase<Route>>
): Route => {
  let match = null
  const sortedRoutes = [...routeCases]
  // reoder cases from the longest route path to the shortest route path
  sortedRoutes.sort((a, b) =>
    pathLength(a.path) < pathLength(b.path) ? 1 : -1
  )
  for (const routeCase of sortedRoutes) {
    if (isPath(routeCase.path)) match = routeCase.path.partialTest(uri)
    else if (uri === routeCase.path) match = {}
    if (match !== null) {
      const route = routeCase.parse(match as Dict)
      if (Either.isLeft(route)) console.warn(route.value)
      return Either.getOrElse(route, () => notFound)
    }
  }
  return notFound
}
export const format = <Route extends {type: string}>(
  route: Route,
  routeCases: List<RouteCase<Route>>
): string => {
  for (const routeCase of routeCases) {
    if (routeCase.type === route.type) {
      return routeCase.format(route, routeCase.path)
    }
  }
  throw new Error("No route case matched with the route")
}
