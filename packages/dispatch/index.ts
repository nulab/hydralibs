import {F1, Curried, List} from "functools-ts"
import {Observable} from "rxjs"
import {map} from "rxjs/operators"

export type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
export type UpdateFn<S> = F1<S, Continuation<S>> & {noReplay?: boolean}

export const DispatchSymbol = Symbol("Dispatch")

export type Dispatch<S> = ((
  update: UpdateFn<S>,
  name?: string,
  noReplay?: boolean
) => void) & {[DispatchSymbol]: boolean}

export interface Dispatcher<S> {
  dispatch: Dispatch<S>
}
export type Get<S, S1> = F1<S, S1>
export type Set<S, S1> = Curried<S1, S, S>

export const isPromise = <S>(
  cont: Continuation<S>
): cont is Promise<F1<S, S>> => cont instanceof Promise

export const isObservable = <S>(
  cont: Continuation<S>
): cont is Observable<F1<S, S>> => !!(cont as any).subscribe

export const isDispatch = <S>(obj: any): obj is Dispatch<S> =>
  !!obj[DispatchSymbol]

export const nullDispatch = ((_: UpdateFn<any>) => {}) as Dispatch<any>
nullDispatch[DispatchSymbol] = true

export interface GetAndSet<S, S1> {
  get: Get<S, S1>
  set: Set<S, S1>
}

export const childDispatchFromLens = <S, S1>(
  parentDispatch: Dispatch<S>,
  lens: GetAndSet<S, S1>
): Dispatch<S1> => {
  let dispatch = (((
    update: UpdateFn<S1>,
    name?: string,
    noReplay?: boolean
  ) => {
    parentDispatch(
      state => {
        const cont = update(lens.get(state))
        if (isPromise(cont))
          return cont.then(pupdate => (state: S) =>
            lens.set(pupdate(lens.get(state)))(state)
          )
        else if (isObservable(cont)) {
          return cont.pipe(
            map(pupdate => (state: S) => {
              const newS1 = pupdate(lens.get(state))
              return lens.set(newS1)(state)
            })
          )
        }
        return lens.set(cont)(state)
      },
      name ? name : update.name,
      noReplay ? noReplay : update.noReplay
    )
  }) as any) as Dispatch<S1>
  dispatch[DispatchSymbol] = true
  return dispatch
}

export const childDispatch = <S, K extends keyof S>(
  parentDispatch: Dispatch<S>,
  key: K
): Dispatch<S[K]> =>
  childDispatchFromLens<S, S[K]>(parentDispatch, {
    get: s => s[key],
    set: s1 => s => ({
      ...s,
      [key]: s1
    })
  })

export const childDispatchFromIndex = <S, S1, K extends keyof S>(parentDispatch: Dispatch<S>, key: K, idx: number): Dispatch<S1> =>
  childDispatchFromLens(parentDispatch, {
    get: (state) => (state[key] as any)[idx],
    set: (item) => state => ({
      ...state,
      [key]: List.set(state[key] as any, idx, item)
    })
  })


/*
export const stateTransition = <S>(...transitions: UpdateFn<S>[]) => (
  dispatch: Dispatch<S>,
): void => {
  if (transitions.length === 0)
    return
  const currentTransition = transitions[0]
  dispatch((state: S) => {
    const res = currentTransition(state)
    if (isPromise(res)) {
      res
        .then(nextState => {
          dispatch(nextState)
          stateTransition(...transitions.slice(1))(dispatch)
        })
        .catch(err => {
          throw err
        })
      return state
    } else if (isObservable(res)) {
      res.subscribe({
        next: nextState => dispatch(nextState),
        complete: () => stateTransition(...transitions.slice(1))(dispatch),
        error: error => {
          throw error
        }
      })
      return state
    } else {
      stateTransition(...transitions.slice(1))(dispatch)
      return res
    }
  })
}

*/
