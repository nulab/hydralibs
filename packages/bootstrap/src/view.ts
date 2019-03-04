import {isDispatch} from "hydra-dispatch"
import {Action} from "redux"
import {createFactory, Component as ReactComponent, PureComponent} from "react"

export type ActionDispatch = (action: Action) => void
export type ActionDispatcher = {dispatch: ActionDispatch}

export class ComponentWithDispatch<P> extends PureComponent<
  P & ActionDispatcher
> {
  constructor(props: P & ActionDispatcher) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
  }

  dispatch<A extends Action>(action: A) {
    return this.props.dispatch(action)
  }
}

export type View<State> =
  | ((state: State) => JSX.Element)
  | {new (state: State): ReactComponent<State>}

const shallowEqual = (first: any, second: any, logDiff?: boolean): boolean =>
  Object.keys(first).every(key => {
    if (
      (first[key] && isDispatch(first[key])) ||
      typeof first[key] === "function"
    )
      return true
    if (logDiff && first[key] !== second[key])
      console.log("diff: ", first[key], second[key])
    return first[key] === second[key]
  })

export const memoizeComponent = <S>(
  view: View<S>,
  logDiff?: boolean
): View<S> => {
  const factory = createFactory(view as any)
  return class MemoizedComponent extends ReactComponent<S> {
    shouldComponentUpdate(nextProps: S) {
      return !shallowEqual(this.props, nextProps, logDiff)
    }

    render() {
      return factory(this.props as any)
    }
  }
}
