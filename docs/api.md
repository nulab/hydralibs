# API documentation


## hydra-dispatch

```ts
export const childDispatch = <S, K extends keyof S>(
  parentDispatch: Dispatch<S>,
  key: K
): Dispatch<S[K]>
```

This function allow you to create a sub dispatch for an property in your state

Example:

```ts
interface Address {
  street: string,
  zipcode: string,
  no: number
}
interface User {
  address: Address,
  name: string
}

const setZipcode = (zipCode: string) => (address: Address): Address => ({
  ...address,
  zipcode
})

export const test = (dispatch: Dispatch<User>) => {
  const addressDispatch = childDispatch<User, "address">(dispatch, "address")
  addressDispatch(setZipcode("29030"))
}

```

```ts
export const childDispatchFromLens<S, S1>(parentDispatch: Dispatch<S>, getAndSet: GetAndSet<S, S>): Dispatch<S1>
```

Same as childDispatch but instead of using a property in the object we use a getter and a setter. It give you more flexibilty and if you are familiar with lens i recommend using monocle-ts. monocle-ts can generate lens easily


```ts
export const takeLatest = (update: Update<S>, name: string): Update<S>
```

Set takeLatest and tag to the function to communicate to the dispatcher that we are interest only in the latest asynchronous update

```ts
export const tag = (update: Update<S>, name: string): Update<S>
```

Set a tag to function, useful for debugging purpose if you use for example redux dev tools

```ts
export const transitions = (...updates: Update<S>[]): Transitions<S>
```

convert a list of updates to a state transition

## hydra-dispatch-react

```ts
export const dispatcherFromReact = <S>(setState: (state: S | F1<S, S>) => void): Dispatch<S>
```
Convert react setState function to a dispatch function

```ts
export const useDispatch = <S>(initialState: S): [S, Dispatch<S>]
```

Custom react hooks to get a state and a dispatch function

## hydra-dispatch-redux

```ts
export const dispatcherFromRedux = <S>(reduxDispatch: Redux.Dispatch): Dispatch<S>
```

Convert a redux dispatch function to a hydra dispatch function

Redux dispatch take an action but hydra dispatch take a function instead
Redux will only schedule functions here


```ts
export const updateStateReducer = <S, A extends Action>(state: S, action: A)
```

You will need to add this reducer in your redux store to get dispatcherFromRedux working

