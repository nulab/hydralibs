import {createStore, compose, Store, applyMiddleware} from "redux"
import thunk from "redux-thunk"
import {updateStateReducer} from "hydra-dispatch-redux"
import * as Todo from "./models/todo"
import { Option } from "functools-ts";

export interface Data {
  todos: Todo.Model[]
}
const State: Data = {
  todos: []
}

export let store: Option<Store<Data>> = null

const isHotReloading = store ? true : false

const composeWithDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
  : compose

if (isHotReloading) {
  store!.replaceReducer(updateStateReducer as any)
} else {
  store = createStore(
    updateStateReducer as any,
    State,
    composeWithDevTools(applyMiddleware(thunk))
  ) as Store<Data>
} 