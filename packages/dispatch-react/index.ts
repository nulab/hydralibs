import {
  UpdateFn,
  isPromise,
  isObservable,
  Dispatch,
  DispatchSymbol,
  DispatchOpts,
  asyncCallTracker
} from "hydra-dispatch"
import {F1} from "functools-ts"


export const dispatcherFromReact = <S>(
  setState: (state: S | F1<S, S>) => void
): Dispatch<S> => {
  const tracker = asyncCallTracker()
  let dispatch = ((
    updateFn: UpdateFn<S>,
    opts?: DispatchOpts
  ) => {
    setState((state: S) => {
      const ret = updateFn(state)
      if (isPromise(ret)) {
        if (opts && opts.tag && opts.takeLatest) {
          const timestamp = tracker.record(opts.tag)
          ret.then(d => {
            const latestRecorded = tracker.latestTimestampRecorded(opts.tag!)
            if (latestRecorded === timestamp)
              setState((state: S) => d(state))
          })
        } else
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


// dispatch(takeLatest(fetchData, "FetchData"))

// Not working now disabled
// export function useDispatch<S>(initialState: S): [S, Dispatch<S>] {
//   const [state, setState] = useState(initialState)
//   const dispatch = dispatcherFromReact(setState)
//   return [state, dispatch]
// }
