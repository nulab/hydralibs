import {Update, isPromise, Dispatch, DispatchSymbol, DispatchOpts, AsyncCallTracker, asyncCallTracker, UpdateFn, isTransitions, Transitions} from "hydra-dispatch"
import {Action, Dispatch as ReduxDispatch} from "redux"
import {isObservable} from "rxjs"

export type SetStateType = "SetState"
export const SetStateType: SetStateType = "SetState"
export interface SetState<S> {
  noReplay?: boolean
  state: S,
  kind: SetStateType
  type: string
}
const SetState = <S>(
  state: S,
  type: string = "SetState",
  noReplay?: boolean
): SetState<S> => ({
  state,
  kind: SetStateType,
  noReplay,
  type
})
export type GotErrorType = "GotError"
export const GotErrorType: GotErrorType = "GotError"
export interface GotError {
  error: Error
  type: GotErrorType
}
const GotError = (error: Error): GotError => ({
  error,
  type: GotErrorType
})

export const isSetState = <S>(action: any): action is SetState<S> =>
  action.kind && action.kind === SetStateType

export const updateStateReducer = <S, A extends Action>(
  state: S,
  action: A
): S => {
  if (isSetState<S>(action)) return action.state
  return state
}

const Schedule = <S>(
  update: UpdateFn<S>,
  tracker: AsyncCallTracker,
  opts: DispatchOpts,
  nextQueue: Transitions<S>
) => (dispatch: ReduxDispatch, getState: () => S) => {
  const state = getState()
  try {
    const cont = update(state)
    if (isPromise(cont)) {
      if (opts.tag && opts.takeLatest) {
        const timestamp = tracker.record(opts.tag)
        cont.then(pupdate => {
          const latestRecorded = tracker.latestTimestampRecorded(opts.tag!)
          if (latestRecorded === timestamp)
            dispatch(Schedule(pupdate, tracker, opts, nextQueue) as any)
        })
      } else {
        cont
          .then(pupdate => dispatch(Schedule(pupdate, tracker, opts, nextQueue) as any))
          .catch(err => dispatch(GotError(err)))
      }
    } else if (isObservable(cont)) {
      cont.subscribe(
        pupdate => dispatch(Schedule(pupdate, tracker, opts, nextQueue) as any),
        err => dispatch(GotError(err))
      )
    } else {
      dispatch(SetState(cont, opts.tag, opts.noReplay))
      if (nextQueue.length !== 0) {
        dispatch(Schedule(nextQueue[0], tracker, opts, nextQueue.slice(1)) as any)
      }

    }
  } catch (err) {
    dispatch(GotError(err))
  }
}

export const dispatcherFromRedux = <S>(
  reduxDispatch: ReduxDispatch
): Dispatch<S> => {
  let tracker = asyncCallTracker()
  let dispatch = ((update: Update<S>, opts?: DispatchOpts) => {
    const dispatchOpts = {
      tag: opts && opts.tag || update.tag || "SetState",
      noReplay: opts && opts.noReplay || update.noReplay || false,
      takeLatest: (opts && opts.takeLatest && opts.tag) || (update.takeLatest && update.tag) ? true : false
    }
    if (isTransitions(update)) {
      const nextQueue = update.slice(1)
      const action = Schedule(update[0], tracker, dispatchOpts, nextQueue)
      reduxDispatch(action as any)
    } else {
      const action = Schedule(update, tracker, dispatchOpts, [])
      reduxDispatch(action as any)
    }
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}
