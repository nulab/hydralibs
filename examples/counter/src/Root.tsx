import React from "react"
import {Dispatch} from "hydra-dispatch"
import {Route, Index} from "./routes"

export interface State {
  counter: number
  route: Route
}
export const State: State = {
  counter: 0,
  route: Index
}

interface Props extends State {
  dispatch: Dispatch<State>
}

const setCounter = (counter: number) => (state: State): State => ({
  ...state,
  counter
})

export const Root = (props: Props): JSX.Element => (
  <>
    <p>{props.counter}</p>
    <button onClick={() => props.dispatch(setCounter(props.counter - 1))}>
      -
    </button>
    <button onClick={() => props.dispatch(setCounter(props.counter + 1))}>
      +
    </button>
  </>
)
