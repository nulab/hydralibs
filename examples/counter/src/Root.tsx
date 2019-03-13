import React from "react"
import {useDispatch} from "hydra-dispatch-react"

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
  const [state, dispatch] = useDispatch(State)
  return (
    <>
      <button onClick={() => dispatch(setCounter(state.counter - 1))}>-</button>
      {state.counter}
      <button onClick={() => dispatch(setCounter(state.counter + 1))}>+</button>
    </>
  )
}