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