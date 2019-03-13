import React, { useState } from "react"
import {Key} from "ts-key-enum"
import { dispatcherFromReact } from "hydra-dispatch-react";
import { Input, List } from "semantic-ui-react";

interface Props {
  value: string
  onSubmit: (newValue: string) => void
}

interface State {
  value: string
  edit: boolean
}
const State = (initialValue: string) => ({
  value: initialValue,
  edit: false
})

const finishEdit = (state: State): State => ({
  ...state,
  edit: false
})

const setValue = (value: string) => (state: State): State => ({
  ...state,
  value
})

const startEdit = (state: State): State => ({
  ...state,
  edit: true
})

export default (props: Props) => {
  const [state, setState] = useState(State(props.value))
  const dispatch = dispatcherFromReact(setState)
  
  return state.edit 
    ? <Input 
             focus
             transparent
             value={state.value}
             onChange={(evt) => dispatch(setValue(evt.target.value))}
             onKeyDown={(evt: any) => { 
               if (evt.key === Key.Enter) {
                 props.onSubmit(state.value)
                 dispatch(finishEdit)
               }
             }} />
    : <p style={{display: "inline-block", minWidth: "150px"}} onClick={() => dispatch(startEdit)}>{props.value}</p>
}