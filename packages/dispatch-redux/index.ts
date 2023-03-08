import {
  Update,
  isPromise,
  Dispatch,
  DispatchSymbol,
  DispatchOpts,
  AsyncCallTracker,
  asyncCallTracker,
  UpdateFn,
  isTransitions,
  Transitions,
} from "hydra-dispatch"
import {Action, Dispatch as ReduxDispatch} from "redux"
import {isObservable} from "rxjs"

type SetStateType = "SetState"
const SET_STATE_TYPE: SetStateType = "SetState"
interface SetState<S> {
  noReplay?: boolean
  state: S
  kind: SetStateType
  type: string
}
const setState = <S>(
  state: S,
  type: string = "SetState",
  noReplay?: boolean
): SetState<S> => ({
  state,
  kind: SET_STATE_TYPE,
  noReplay,
  type,
})
type GotErrorType = "GotError"
const GOT_ERROR_TYPE: GotErrorType = "GotError"
interface GotError {
  error: Error
  type: GotErrorType
}
const gotError = (error: Error): GotError => ({
  error,
  type: GOT_ERROR_TYPE,
})

const isSetState = <S>(action: any): action is SetState<S> =>
  action.kind && action.kind === SET_STATE_TYPE

export const updateStateReducer = <S, A extends Action>(
  state: S,
  action: A
): S => {
  if (isSetState<S>(action)) return action.state
  return state
}

const schedule =
  <S>(
    update: UpdateFn<S>,
    tracker: AsyncCallTracker,
    opts: DispatchOpts,
    nextQueue: Transitions<S>
  ) =>
  (dispatch: ReduxDispatch, getState: () => S) => {
    const state = getState()
    try {
      const cont = update(state)
      if (isPromise(cont)) {
        if (opts.tag && opts.takeLatest) {
          const timestamp = tracker.record(opts.tag)
          cont.then((pupdate) => {
            const latestRecorded = tracker.latestTimestampRecorded(opts.tag!)
            if (latestRecorded === timestamp)
              dispatch(schedule(pupdate, tracker, opts, nextQueue) as any)
          })
        } else {
          cont
            .then((pupdate) =>
              dispatch(schedule(pupdate, tracker, opts, nextQueue) as any)
            )
            .catch((err) => dispatch(gotError(err)))
        }
      } else if (isObservable(cont)) {
        cont.subscribe(
          (pupdate) =>
            dispatch(schedule(pupdate, tracker, opts, nextQueue) as any),
          (err) => dispatch(gotError(err))
        )
      } else {
        dispatch(setState(cont, opts.tag, opts.noReplay))
        if (nextQueue.length !== 0) {
          dispatch(
            schedule(nextQueue[0], tracker, opts, nextQueue.slice(1)) as any
          )
        }
      }
    } catch (err) {
      dispatch(gotError(err))
    }
  }

export const dispatcherFromRedux = <S>(
  reduxDispatch: ReduxDispatch
): Dispatch<S> => {
  let tracker = asyncCallTracker()
  let dispatch = ((update: Update<S>, opts?: DispatchOpts) => {
    const dispatchOpts = {
      tag: (opts && opts.tag) || update.tag || "SetState",
      noReplay: (opts && opts.noReplay) || update.noReplay || false,
      takeLatest:
        (opts && opts.takeLatest && opts.tag) ||
        (update.takeLatest && update.tag)
          ? true
          : false,
    }
    if (isTransitions(update)) {
      const nextQueue = update.slice(1)
      const action = schedule(update[0], tracker, dispatchOpts, nextQueue)
      reduxDispatch(action as any)
    } else {
      const action = schedule(update, tracker, dispatchOpts, [])
      reduxDispatch(action as any)
    }
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}
