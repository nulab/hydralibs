# Introduction

Hydralibs is a suite of library to help you writing your application faster with less boilerplate using react

hydra-dispatch for example is a library aimed to simplify how we update the state

If you are familiar with redux then you are familiar with its dispatch function
hydra-dispatch add the capability of dispatching function
Dispatch accept three kind of function:

- Synchronous
```ts
(state: State) => State
```
- Asynchronous
```ts
async (state: State) => Promise<(state: State) => State>
```
The return type of this one can looks weird but it is like that for good reason
When dispatch call the function and when the promise is resolve the state might have changed. 
Dispatch need to pass you the new state so you can update your state safely
- Streams
```ts
(state: State): Observable<(state: State) => State>
```
Note here your stream must emit function not data for the same reason as asynchronous one

Ok all good but you probably wondering how can we pass more arguments to our function. The response is simply to use closure

Example:
```ts
interface State {
  name: string
}

const setName = (name: string) => (state: State): State => ({
  ...state,
  name
})
```
Et voila

Also dispatch can compose

Example:
```tsx
interface User {
  id: number,
  name: string,
  age: number
}

interface Project {
  name: string
}

interface State {
  user: User
  project: Project
}
const State: State = {
  user: {
    id: 1,
    name: "John",
    age: 23
  }
}

const setName = (name: string) => (user: User): User => ({
  ...user,
  name
})

export const Root = () => {
  const [state, setState] = useState(State)
  const dispatch = dispatcherFromReact(setState)
  const userDispatch = childDispatch<State, "user">(dispatch, "user")

  return (
    <input 
      type="text"
      value={state.name} 
      onChange={evt => userDispatch(setName(evt.target.value))} />
  )
}

```
For more information please look at API docs

# Setup an application created with create-react-app cli

At first let's create a new project:

```sh
npx create-react-app tutorial --typescript
cd tutorial
```

Then install hydra-dispatch and hydra-dispatch-react:
```
yarn install hydra-dispatch@0.1.0 hydra-dispatch-react@0.1.0
```

If you only want to use react this is finished and you can use hydra-dispatch in your application

If you want to use redux please continue to read

First we need to install redux:

```
yarn install hydra-dispatch@0.1.0 hydra-dispatch-redux@0.1.0 redux react-redux
```
