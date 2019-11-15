# Introduction

Hydralibs is a suite of libraries for writing a web application with less boilerplate using react

At first let's look at hydra-dispatch

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
The return type of this one can looks weird but it is designed like that for good reasons.
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

## Setup an application created with create-react-app cli

At first let's create a new project:

```sh
npx create-react-app tutorial --typescript
cd tutorial
```

Then install hydra-dispatch and hydra-dispatch-react:
```
yarn add hydra-dispatch@0.1.0 hydra-dispatch-react@0.1.0
```

If you only want to use react this is finished and you can use hydra-dispatch in your application

If you want to use redux please continue to read

First we need to install redux:

```
yarn add hydra-dispatch@0.1.0 hydra-dispatch-redux@0.1.0 redux react-redux redux-thunk
```

Let's create our models:

todo.ts
```ts
export interface Todo {
  id: number,
  name: string,
  created: Date
}

let curId = 0

const nextId = () => {
  curId += 1
  return curId
}

export const createTodo = (name: string): Todo => ({
  id: nextId(),
  name,
  created: new Date()
})
```

Then we need to create our store:

store.ts
```ts
import {createStore, compose, Store, applyMiddleware} from "redux"
import thunk from "redux-thunk"
import {updateStateReducer} from "hydra-dispatch-redux"
import {Todo} from "./todo";

export interface Data {
  todos: Todo[]
}
const Data: Data = {
  todos: []
}

const composeWithDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  : compose

export const store: Store<Data> = createStore(
  updateStateReducer as any,
  Data,
  composeWithDevTools(applyMiddleware(thunk))
)
```

index.tsx need to change a little bit
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {store} from './store';
import {Provider} from "react-redux"

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , 
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```

Then our App component will change a bit too:

```tsx
import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Data } from './store';
import {Dispatch} from "hydra-dispatch"
import {Todo, createTodo} from './todo';
import { connect } from 'react-redux';
import { dispatcherFromRedux } from 'hydra-dispatch-redux';

interface Props {
  todos: Todo[]
  dispatch: Dispatch<Data>
}

const addTodo = (name: string) => (state: Data): Data => ({
  ...state,
  todos: [createTodo(name), ...state.todos]
})

const App = (props: Props) => {
  const [name, setName] = useState("")
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        
        </a>
        <input type="text" value={name} onChange={evt => setName(evt.target.value)} />
        <button disabled={name.length === 0} 
          onClick={() => {
            props.dispatch(addTodo(name))
            setName("")
          }}
        >Add</button>
        <ul>
          {props.todos.map(todo =>
            <li key={`todo-${todo.id}`}>{todo.name}</li>
          )}
        </ul>
      </header>
    </div>
  );
}

export default connect(
  (state: Data) => ({
    todos: state.todos
  }),
  (dispatch) => ({
    dispatch: dispatcherFromRedux<Data>(dispatch)
  })
)(App)
```

Et voila you had setup a sample application using react, redux and hydra-dispatch-redux

## What about race condition with async function ?

In the version 0.2.8 we introduce a new annotation for function being dispatched so you can tell to dispatch that you are only interested to apply with the latest async function resolved.

Example:
```tsx
interface User {
  id: number
  name: string
}

interface State {
  readonly users: User[]
}
const State: State = {
  users: []
}

const sleep = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time))

const fetchUsers = (from: number, limit: number) => async (state: State) => {
  await sleep(1000)
  return (state: State) => ({
    users: [{id: 1, name: "John"}]
  })
}

const UserList = () => {
  const [state, setState] = useState(State)
  const dispatch = dispatcherFromReact(setState)
  
  return (
    <>
      <ul>
        {state.users.map(user => <li>{user.name}</li>)}
      </ul>
      <button onClick={() => dispatch(takeLatest(fetchUsers(0, 10)), "fetchUsers")}></button>
    </>
  )
}

# 

```

## Using transition (Experimental)

State transition solve a common problem when you want to describe your update step by step. For example when you start loading data, you would like to set first the data to loading then fetch the data. This is now possible without requiring to call dispatch twice.

```typescript

import {createStore, compose, Store, applyMiddleware} from "redux"
import thunk from "redux-thunk"
import {updateStateReducer, dispatcherFromRedux} from "./index"
import { transitions } from "hydra-dispatch";

interface Book {
  id: number
  name: string,
  description: string
}
const Book = (id: number, name: string, description: string = ""): Book => ({
  id,
  name,
  description
})

interface State {
  books: ReadonlyArray<Book>
  loading: boolean
}
const State: State = {
  books: [],
  loading: false
}

const setLoading = (state: State) => ({
  ...state,
  loading: true
})

const fetchBooks = async (_: State) => {
  const books = [Book(1, "test")]
  return Promise.resolve((state: State) => ({loading: false, books}))
}

const store = createStore(
    updateStateReducer as any,
    initialState,
    compose(applyMiddleware(thunk))
  ) as any

const dispatch = dispatcherFromRedux(store.dispatch)
dispatch(transitions(setLoading, fetchBooks))

store.subscribe(() => console.log(store.getState()))

```

This currently works with synchronous function, asynchronous and finite stream.

# Using with monocle-ts

monocle-ts is a very good library for lens
You probably wondering what lens are
Lens solve a common problem in functional programming when using nested immutable record.
Updating a nested property in the record in immutable record is verbose so lens were created to solve this particuliar problem.

I recommend checking out the repository:
https://github.com/gcanti/monocle-ts



