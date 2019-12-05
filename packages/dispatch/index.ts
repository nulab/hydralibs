import {F1, Curried, List, Option} from "functools-ts"
import {Observable} from "rxjs"
import {map} from "rxjs/operators"

export type DispatchOpts = {
  tag?: string,
  noReplay?: boolean,
  takeLatest?: boolean
}

export type Continuation<S> = S | Promise<F1<S, S>> | Observable<F1<S, S>>
export type UpdateFn<S> = F1<S, Continuation<S>>
export type Transitions<S> = List<UpdateFn<S>>
export type Update<S> = (UpdateFn<S> | Transitions<S>) & DispatchOpts

export const defer = (f: () => void): Promise<void> =>
  new Promise((resolve, reject) => setTimeout(() => {
      try {
        f()
        resolve()
      } catch (ex) {
        reject(ex)
      }
    }
  ))

export const DispatchSymbol = Symbol("Dispatch")

export type Dispatch<S> = ((
  update: Update<S>,
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

export const isTransitions = <S>(update: Update<S>): update is Transitions<S> =>
  update instanceof Array

const mapUpdateTo = <S, S1>(lens: GetAndSet<S, S1>, checkCancellation?: () => boolean) => (updateFn: UpdateFn<S1>): UpdateFn<S> => state => {
  if (checkCancellation && checkCancellation()) return state
  const cont = updateFn(lens.get(state))
  if (isPromise(cont))
    return cont.then(pupdate => (state: S) => {
      if (checkCancellation && checkCancellation()) return state
      return lens.set(pupdate(lens.get(state)))(state)
    })
  else if (isObservable(cont)) {
    return cont.pipe(
      map(pupdate => (state: S) => {
        if (checkCancellation && checkCancellation()) return state
        const newS1 = pupdate(lens.get(state))
        return lens.set(newS1)(state)
      })
    )
  }
  return lens.set(cont)(state)
}

export const childDispatchFromLens = <S, S1>(
  parentDispatch: Dispatch<S>,
  lens: GetAndSet<S, S1>,
  checkCancellation?: () => boolean
): Dispatch<S1> => {
  let dispatch = (((
    update: Update<S1>,
    opts?: DispatchOpts
  ) => {
    const optsParam: DispatchOpts = {
      tag: opts && opts.tag ? opts.tag : update.tag,
      noReplay: opts && opts.noReplay ? opts.noReplay : update.noReplay,
      takeLatest: opts && opts.takeLatest && opts.tag ? opts.takeLatest : update.takeLatest
    }
    if (isTransitions(update)) {
      parentDispatch(
        update.map(mapUpdateTo(lens, checkCancellation)),
        optsParam
      )
    } else {
      parentDispatch(
        mapUpdateTo(lens, checkCancellation)(update), optsParam
      )
    }
  }) as any) as Dispatch<S1>
  dispatch[DispatchSymbol] = true
  return dispatch
}

export const childDispatch = <S, K extends keyof S>(
  parentDispatch: Dispatch<S>,
  key: K,
  checkCancellation?: () => boolean
): Dispatch<S[K]> =>
  childDispatchFromLens<S, S[K]>(parentDispatch, {
    get: s => s[key],
    set: s1 => s => ({
      ...s,
      [key]: s1
    })
  }, checkCancellation)

export const childDispatchFromIndex = <S, S1, K extends keyof S>(
  parentDispatch: Dispatch<S>, 
  key: K, 
  idx: number, 
  checkCancellation?: () => boolean): Dispatch<S1> => {
    return childDispatchFromLens(parentDispatch, {
      get: (state) => (state[key] as any)[idx],
      set: (item) => state => ({
        ...state,
        [key]: List.set(state[key] as any, idx, item)
      })
    }, checkCancellation)
}

export const asyncCallTracker = (): AsyncCallTracker => {
  let asyncCalls: AsyncCalls = {}
  return {
    latestTimestampRecorded(name: string): number {
      if (Option.isEmpty(asyncCalls[name]))
        throw new Error(`No async call found for name: ${name} this is probably a bug in dispatch-react`)
      return asyncCalls[name]
    },
    record(name: string): number {
      if (Option.isEmpty(asyncCalls[name]))
        asyncCalls[name] = 0
      else if (asyncCalls[name] === Number.MAX_SAFE_INTEGER)
        asyncCalls[name] = 0
      else
        asyncCalls[name] += 1
      return asyncCalls[name]
    }
  }
}

export const takeLatest = <S>(update: Update<S>, name: string): Update<S> => {
  update.tag = name
  update.takeLatest = true
  return update
}

export const disableReplay = <S>(update: Update<S>): Update<S> => {
  update.noReplay = false
  return update
}

export const transitions = <S>(...updates: UpdateFn<S>[]): Transitions<S> => updates

export const tag = <S>(update: Update<S>, name: string): Update<S> => {
  update.tag = name
  return update
}
