import React, { useState } from "react"
import {Dispatch, childDispatchFromIndex} from "hydra-dispatch"
import { List } from "functools-ts";
import * as Todo from "./models/todo"
import { connect } from "react-redux"
import { dispatcherFromRedux } from "hydra-dispatch-redux"
import TodoItem from "./Todo"
import { Data } from "./store";
import {Input, Button, List as ListView, Icon} from "semantic-ui-react"

export interface State {
  todos: List<Todo.Model>
}

export const State: State = {
  todos: []
}

interface Props extends State {
  dispatch: Dispatch<State>
}

const add = (name: string) => (state: State) => ({
  todos: [...state.todos, Todo.create(name)]
})
const remove = (todoToRemove: Todo.Model) => (state: State) => ({
  todos: state.todos.filter(todo => todo.id !== todoToRemove.id)
})

const AddTodo = (props: Props) => {
  const [name, setName] = useState("")
  return <div id="add-todo">
    <Input placeholder="Task..." value={name} onChange={(evt) => setName(evt.target.value)} />
    <Button disabled={name.length === 0} basic onClick={() => {
      props.dispatch(add(name))
      setName("")
    }}><Icon name="plus"/></Button>
  </div>
}

const View = (props: Props) => {
  return <>
    <AddTodo {...props} />
    <ListView divided relaxed selection verticalAlign="middle">
      {props.todos.map((todo, idx) => 
        <ListView.Item key={todo.id}>

          <TodoItem
            todo={todo}
            key={todo.id} 
            dispatch={childDispatchFromIndex(props.dispatch, "todos", idx)} 
            onRemove={() => props.dispatch(remove(todo))}
          />
        </ListView.Item>
      )}
    </ListView>
  </>
}

export default connect(
  (state: Data) => ({
    todos: state.todos
  }),
  reduxDispatch => ({
    dispatch: dispatcherFromRedux(reduxDispatch)
  })
)(View)