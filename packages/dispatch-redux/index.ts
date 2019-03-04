import {UpdateFn, isPromise, Dispatch, DispatchSymbol} from "hydra-dispatch"
import {Action, Dispatch as ReduxDispatch} from "redux"
import {isObservable} from "rxjs"

export type SetStateType = "SetState"
export const SetStateType: SetStateType = "SetState"
export interface SetState<S> {
  name?: string
  noReplay?: boolean
  state: S
  type: SetStateType
}
const SetState = <S>(
  state: S,
  name?: string,
  noReplay?: boolean
): SetState<S> => ({
  state,
  name,
  noReplay,
  type: SetStateType
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

export const updateStateReducer = <S, A extends Action>(
  state: S,
  action: A
) => {
  if (action.type === "SetState") return ((action as any) as SetState<S>).state
  return state
}

const Schedule = <S>(
  update: UpdateFn<S>,
  name?: string,
  noReplay?: boolean
) => (dispatch: ReduxDispatch, getState: () => S) => {
  const state = getState()
  try {
    const cont = update(state)
    if (isPromise(cont)) {
      cont
        .then(pupdate => dispatch(Schedule(pupdate, name, noReplay) as any))
        .catch(err => dispatch(GotError(err)))
    } else if (isObservable(cont)) {
      cont.subscribe(
        pupdate => dispatch(Schedule(pupdate, name, noReplay) as any),
        err => dispatch(GotError(err))
      )
    } else dispatch(SetState(cont, name, noReplay))
  } catch (err) {
    dispatch(GotError(err))
  }
}

export const dispatchFromRedux = <S>(
  reduxDispatch: ReduxDispatch
): Dispatch<S> => {
  let dispatch = ((update: UpdateFn<S>, name?: string, noReplay?: boolean) => {
    const action = Schedule(update, name ? name : "", noReplay ? true : false)
    reduxDispatch(action as any)
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}
