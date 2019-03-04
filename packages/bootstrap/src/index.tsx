import {
  Store,
  Dispatch as ReduxDispatch,
  applyMiddleware,
  compose,
  createStore
} from "redux"
import {composeWithDevTools} from "remote-redux-devtools"
import {Provider, connect} from "react-redux"
import {Dispatch, Dispatcher, childDispatch} from "hydra-dispatch"
import {
  SetState,
  GotError,
  dispatchFromRedux,
  GotErrorType,
  SetStateType,
  updateStateReducer
} from "hydra-dispatch-redux"
import * as Router from "./router"
import {RouteCase, parse, format} from "hydra-router"
import {List, F1} from "functools-ts"
import {
  isReplaying,
  setMonitor,
  flagReplaying,
  defer,
  actionWithDispatch
} from "./dispatchMiddleware"
import {ComponentWithDispatch, ActionDispatcher} from "./view"
import React from "react"
import {hot} from "react-hot-loader"
import thunk from "redux-thunk"

export enum ActionType {
  Init = "Hydra/Init"
}
export interface Init {
  type: ActionType.Init
}
export const Init = {
  type: ActionType.Init
}
let store: Store<any>

const envName = process.env.NODE_ENV || "development"

/**
 * @description Application options
 * Enable to change the base path of your application
 * or change settings of remote dev tools server
 */
export interface Opts {
  basePath?: string
  remoteDevTools?: {
    name: string
    hostname: string
    port: number
  }
  onLoad?: () => any
  onHMR?: () => any
}
const defaultsOpts: Opts = {
  basePath: "",
  // remoteDevTools: {
  //   name: "My React App",
  //   hostname: "localhost",
  //   port: 8000
  // },
  onLoad: () => null
}

/**
 * @description
 * Application hooks
 * Allow the application to react when the application finished to bootstrap,
 * when the location changed or when an uncaught error occured
 */
export interface Hooks<State, Route> {
  onInit?: (
    state: State,
    dispatch: Dispatch<State>,
    setRoute: Router.SetRoute<Route>
  ) => void
  onRouteChanged?: (
    state: State,
    dispatch: Dispatch<State>,
    setRoute: Router.SetRoute<Route>
  ) => void
  onError?: (
    state: State,
    error: Error,
    dispatch: Dispatch<State>,
    setRoute: Router.SetRoute<Route>
  ) => void
}

export type Action<S> = Init | GotError | SetState<S>

/**
 * @description bootstrap an application
 * This function setup your application with a store, router and devtools if environment is development
 * @param initialState initial state of the applications
 * @param RootView
 * @param routes a list of all routes of the application
 * @param notFound when the path is not found this will use this route
 * @param module
 * @param render a renderer like ReactDOM or another react renderer
 * @param hooks a list of hooks to call when some events happen
 * @param opts
 */
export const bootstrap = <State extends Router.State<Route>, Route>(
  initialState: State,
  RootView: (state: State & Dispatcher<State>) => JSX.Element,
  routes: List<RouteCase<Route>>,
  notFound: Route,
  module: NodeModule,
  render: F1<JSX.Element, void>,
  hooks: Hooks<State, Route> = {},
  opts: Opts = defaultsOpts
): void => {
  type ActionWithDispatch = Action<State> & {dispatchFromUpdate: ReduxDispatch}

  const fromUri = (uri: string): Route => parse(uri, notFound, routes)
  const toUri = (route: Route): string => format(route as any, routes)

  /**
   * @description handling action and calling hooks
   * when it detect the route has change,
   * the application has finished to bootstrap
   * or an uncaught error occured
   * @param state
   * @param action
   */
  const handleAction = (state: State, action: ActionWithDispatch): State => {
    if (isReplaying() && (action as any).noReplay) return state
    const dispatch = dispatchFromRedux<State>(action.dispatchFromUpdate)
    const setRoute = Router.buildSetRoute(
      toUri,
      childDispatch<State, "route">(dispatch, "route"),
      opts.basePath
    )
    switch (action.type) {
      case ActionType.Init:
        hooks.onInit ? hooks.onInit(state, dispatch, setRoute) : null
        return state
      case SetStateType:
        if (action.name === Router.SetRouteType)
          hooks.onRouteChanged
            ? hooks.onRouteChanged(state, dispatch, setRoute)
            : null
        return state
      case GotErrorType:
        hooks.onError
          ? hooks.onError(state, action.error, dispatch, setRoute)
          : null
    }
    return state
  }

  /**
   * Setup remote dev tools and redux dev tools
   */
  const composeEnhancers = opts.remoteDevTools
    ? composeWithDevTools(Object.assign(opts.remoteDevTools, {realtime: true}))
    : (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        getMonitor: (monitor: any) => {
          setMonitor(monitor)
        }
      })
    : compose

  const isHotReloading = store ? true : false

  const reducer = (state: State, action: ActionWithDispatch): State =>
    handleAction(updateStateReducer(state, action), action)

  if (isHotReloading) {
    flagReplaying(true)
    store.replaceReducer(reducer)
    defer(() => flagReplaying(false))
  } else {
    store = (createStore as any)(
      reducer,
      initialState,
      composeEnhancers(
        applyMiddleware(thunk),
        applyMiddleware(actionWithDispatch)
      )
    )
  }
  if (opts.onLoad) opts.onLoad()

  /**
   * Index component will wrap the RootView and setup routing
   */
  class Index extends ComponentWithDispatch<State> {
    unloadRouter: () => void

    constructor(props: State & ActionDispatcher) {
      super(props)
      if (typeof (window as any).__REACT_HOT_LOADER__ !== "undefined") {
        ;(window as any).__REACT_HOT_LOADER__.warnings = false
      }
    }

    componentWillMount() {
      const dispatch = dispatchFromRedux<State>(this.props.dispatch as any)
      const setRoute = childDispatch<State, "route">(dispatch, "route")
      this.unloadRouter = Router.load(
        setRoute,
        fromUri,
        toUri,
        opts.basePath,
        isHotReloading
      )
      if (!isHotReloading) this.props.dispatch(Init)
    }

    componentWillUnmount() {
      this.unloadRouter()
    }

    render() {
      // Force TS to see RootJSXElement as an SFC due to this bug:
      // https://github.com/Microsoft/TypeScript/issues/15463

      const dispatch = dispatchFromRedux<State>(this.props.dispatch as any)
      return RootView({...(this.props as State), dispatch})
    }
  }

  const View = connect((s: State) => s)(Index as any)

  if (envName === "development") {
    const App = render(
      <Provider store={store}>
        <View />
      </Provider>
    )
    hot(module)(App)
  } else {
    render(
      <Provider store={store}>
        <View />
      </Provider>
    )
  }
}
