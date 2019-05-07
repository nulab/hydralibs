import React, { useState } from "react"
import {dispatcherFromReact} from "hydra-dispatch-react"

export interface State {
  counter: number
}
export const State: State = {
  counter: 0,
}

const setCounter = (counter: number) => (state: State): State => ({
  ...state,
  counter
})

export const Root = (): JSX.Element => {
  const [state, setState] = useState(State)
  const dispatch = dispatcherFromReact(setState)
  return (
    <>
      <button onClick={() => dispatch(setCounter(state.counter - 1))}>-</button>
      {state.counter}
      <button onClick={() => dispatch(setCounter(state.counter + 1))}>+</button>
    </>
  )
}