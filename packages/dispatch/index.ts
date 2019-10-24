import {F1, Curried, List, Option} from "functools-ts"
import {Observable} from "rxjs"
import {map} from "rxjs/operators"

export type DispatchOpts = {
  tag?: string,
  noReplay?: boolean,
  takeLatest?: boolean
}

export type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
export type UpdateFn<S> = F1<S, Continuation<S>> & DispatchOpts

export const DispatchSymbol = Symbol("Dispatch")

export type Dispatch<S> = ((
  update: UpdateFn<S>,
  opts?: DispatchOpts
) => void) & {[DispatchSymbol]: boolean}

export interface Dispatcher<S> {
  dispatch: Dispatch<S>
}
export type Get<S, S1> = F1<S, S1>
export type Set<S, S1> = Curried<S1, S, S>

type AsyncCalls = {[key: string]: number}
export interface AsyncCallTracker {
  latestTimestampRecorded(name: string): number
  record(name: string): number
}

/**
 * @description test if continuation is a promise
 * instanceof on promise is not reliable to test if a continuation is a promise
 * otherwise we test the constructor name and at last resort we test
 * if the continuation looks like a promise
 * @param cont
 */
export const isPromise = <S>(
  cont: Continuation<S>
): cont is Promise<F1<S, S>> => {
  const contAny = cont as any
  return contAny instanceof Promise || (contAny.constructor && contAny.constructor.name === "Promise") ||
    (typeof contAny.then === "function" && typeof contAny.catch === "function")
}

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
    opts?: DispatchOpts
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
      {
        tag: opts && opts.tag ? opts.tag : update.tag,
        noReplay: opts && opts.noReplay ? opts.noReplay : update.noReplay,
        takeLatest: opts && opts.takeLatest && opts.tag ? opts.takeLatest : update.takeLatest
      }
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



export const asyncCallTracker = (): AsyncCallTracker => {
  let asyncCalls: AsyncCalls = {}
  return {
    latestTimestampRecorded(name: string): number {
      if (Option.isEmpty(asyncCalls[name]))
        throw new Error(`No async call found for name: ${name} this is probably a bug in dispatch-react`)
      return asyncCalls[name]
    },
    record(name: string): number {
      asyncCalls[name] = Date.now()
      return asyncCalls[name]
    }
  }
}

export const takeLatest = <S>(update: UpdateFn<S>, name: string): UpdateFn<S> => {
  update.tag = name
  update.takeLatest = update.takeLatest
  return update
}

export const disableReplay = <S>(update: UpdateFn<S>): UpdateFn<S> => {
  update.noReplay = false
  return update
}

export const tag = <S>(update: UpdateFn<S>, name: string): UpdateFn<S> => {
  update.tag = name
  return update
}
