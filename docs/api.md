# API documentation

## hydra-dispatch

```ts
export type Continuation<S> = S | Promise<F1<S,S>> | Observable<F1<S, S>>
export type UpdateFn<S> = F1<S, Continuation<S>>
```

```ts
export type Dispatch<S> = ((
  update: UpdateFn<S>,
  name?: string,
  noReplay?: boolean
) => void) & {[DispatchSymbol]: boolean}
```

Note: name and noReplay represent only meta information for development purpose

```ts
export const isPromise = <S>(cont: Continuation<S>): cont is Promise<F1<S, S>>
```

```ts
export const isObservable = <S>(cont: Continuation<S>): cont is Observable<F1<S, S>>
```

```ts
export const isDispatch = <S>(obj: any): obj is Dispatch<S>
```

```ts
export const nullDispatch: Dispatch<any>
```

nullDispatch does nothing, it can be used for testing purpose

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

Same as childDispatch but instead of using a property in the object we use a getter and a setter
It give you more flexibility about how to get and set a value from S

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

You need to add this reducer in your redux store to get dispatcherFromRedux working 
