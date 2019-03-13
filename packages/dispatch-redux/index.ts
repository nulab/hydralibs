import {UpdateFn, isPromise, Dispatch, DispatchSymbol} from "hydra-dispatch"
import {Action, Dispatch as ReduxDispatch} from "redux"
import {isObservable} from "rxjs"

export type SetStateType = "SetState"
export const SetStateType: SetStateType = "SetState"
export interface SetState<S> {
  noReplay?: boolean
  state: S
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

export const dispatcherFromRedux = <S>(
  reduxDispatch: ReduxDispatch
): Dispatch<S> => {
  let dispatch = ((update: UpdateFn<S>, name?: string, noReplay?: boolean) => {
    const action = Schedule(update, name || update.name || "SetState" , noReplay ? true : false)
    reduxDispatch(action as any)
  }) as Dispatch<S>
  dispatch[DispatchSymbol] = true
  return dispatch
}
