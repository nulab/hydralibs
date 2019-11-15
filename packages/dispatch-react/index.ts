import {
  isPromise,
  isObservable,
  Dispatch,
  DispatchSymbol,
  DispatchOpts,
  asyncCallTracker,
  Update,
  isTransitions,
  UpdateFn,
  AsyncCallTracker,
  defer
} from "hydra-dispatch"
import {F1} from "functools-ts"


const runUpdateFn = <S>(updateFn: UpdateFn<S>,
                        setState: (state: S | F1<S, S>) => void,
                        tracker: AsyncCallTracker,
                        opts?: DispatchOpts): Promise<void> => {
  return new Promise((resolve, reject) => {
    setState(state => {
      const ret = updateFn(state)
      if (isPromise(ret)) {
        if (opts && opts.tag && opts.takeLatest) {
          const timestamp = tracker.record(opts.tag)
          ret.then(d => {
            const latestRecorded = tracker.latestTimestampRecorded(opts.tag!)
            if (latestRecorded === timestamp)
              setState((state: S) => d(state))
          })
          .then(resolve)
          .catch(reject)
        } else
          ret.then(d => setState((state: S) => d(state)))
            .then(resolve)
            .catch(reject)
        return state
      } else if (isObservable(ret)) {
        defer(() =>
          ret.subscribe(d => setState((state: S) => d(state)), reject, resolve)
        )
        return state
      } else {
        defer(() => resolve())
        return ret
      }
    })
  })
}

export const dispatcherFromReact = <S>(
  setState: (state: S | F1<S, S>) => void
): Dispatch<S> => {
  const tracker = asyncCallTracker()
  let dispatch = ((
    update: Update<S>,
    opts?: DispatchOpts
  ) => {
    const dispatchOpts: DispatchOpts = {
      tag: opts && opts.tag || update.tag || "SetState",
      noReplay: opts && opts.noReplay || update.noReplay || false,
      takeLatest: (opts && opts.takeLatest && opts.tag) || (update.tag && update.takeLatest) ? true : false
    }
    if (isTransitions(update)) {
      runUpdateFn(update[0], setState, tracker, dispatchOpts)
        .then(() => {
          if (update.length > 1)
            dispatch(update.slice(1), dispatchOpts)
        })
        .catch(err => console.error(`An error happened while running the transitions ${err.message || err}`))
    } else {
      runUpdateFn(update, setState, tracker, dispatchOpts)
        .catch(err => console.error(`An error happened while running the function ${err.message || err}`))
    }
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}

export interface MockStore<S> {
  state: S
  setState: (newState: F1<S, S> | S) => void
}

export const mockSetState = <S>(initialState: S): MockStore<S> => {
  let store = {
    state: initialState,
    setState : (newState: F1<S, S> | S) => {
      if (typeof newState === "function") {
        store.state = (newState as F1<S, S>)(store.state)
      } else {
        store.state = newState
      }
    }
  }
  return store
}

