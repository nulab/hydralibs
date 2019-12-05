import {F1} from "functools-ts"
import {expect} from "chai"
import {Dispatch, UpdateFn, DispatchSymbol, isPromise, isObservable, childDispatch} from "./index"

interface State<A> {
  value: A
}

const createSetState = <S>(initial: S): [State<S>, (newState: S | F1<S, S>) => void] => {
  let state: State<S> = {value: initial}
  const setState = (newState: S | F1<S, S>) => {
    if (typeof newState === "function")
      state.value = (newState as F1<S, S>)(state.value)
    else
      state.value = newState as S
  }
  return [state, setState]
}

const testDispatch = <S>(setState: (state: S | F1<S, S>) => void): Dispatch<S> => {
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

interface User {
  name: string
}

interface App {
  user: User
}

describe("dispatch", () => {
  it("should update the state", () => {
    const [state, setState] = createSetState({user: {name: "test"}})
    const dispatch = childDispatch<App, "user">(testDispatch(setState), "user")
    const setName = (name: string) => (_: User): User => ({name})
    dispatch(setName("newname"))
    expect(state.value.user.name).eql("newname")
  })

  it("should update the state with an async function", () => {
    const [state, setState] = createSetState({user: {name: "test"}})
    const dispatch = childDispatch<App, "user">(testDispatch(setState), "user")
    const setName = (name: string) => async (_: User) =>
      Promise.resolve((_: User): User => ({name}))
    dispatch(setName("newuser"))
    setTimeout(() => expect(state.value.user.name).eql("newuser"), 0)
  })

  it("should cancel updates if checkCancellation return true", async () => {
    const [state, setState] = createSetState({user: {name: "test"}})
    const dispatch = childDispatch<App, "user">(testDispatch(setState), "user", () => true)
    const setName = (name: string) => async (_: User) =>
      Promise.resolve((_: User): User => ({name}))
    dispatch(setName("test2"))
    setTimeout(() => expect(state.value.user.name).eql("test"), 0);
  })
})
