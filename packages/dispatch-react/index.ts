import {
  UpdateFn,
  isPromise,
  isObservable,
  Dispatch,
  DispatchSymbol
} from "hydra-dispatch"
import {F1} from "functools-ts"
import {useState} from "react"

export const dispatcherFromReact = <S>(
  setState: (state: S | F1<S, S>) => void
): Dispatch<S> => {
  let dispatch = ((
    updateFn: UpdateFn<S>,
    _name?: string,
    _noReplay?: boolean
  ) => {
    setState((state: S) => {
      const ret = updateFn(state)
      if (isPromise(ret)) {
        ret.then(d => setState((state: S) => d(state)))
        return state
      } else if (isObservable(ret)) {
        ret.subscribe(d => setState((state: S) => d(state)))
        return state
      } else {
        return ret
      }
    })
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}

export const useDispatch = <S>(initialState: S): [S, Dispatch<S>] => {
  const [state, setState] = useState(initialState)
  const dispatch = dispatcherFromReact(setState)
  return [state, dispatch]
}
