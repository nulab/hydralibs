import React from "react"
import * as Todo from "./models/todo"
import EditableText from "./EditableText"
import { Dispatch } from "hydra-dispatch";
import { Button, Icon, Checkbox, List } from "semantic-ui-react";


interface Props {
  todo: Todo.Model
  dispatch: Dispatch<Todo.Model>
  onRemove: () => void
}

export default (props: Props) => {
  return (
    <>
      <List.Icon size="large" name="tag" verticalAlign="middle"/>
      <List.Content verticalAlign="middle">
        <List.Header>
          <EditableText value={props.todo.name} onSubmit={(name) => props.dispatch(Todo.setName(name))} />
          <Checkbox
              verticalAlign="middle"
              checked={props.todo.checked} 
              onChange={() => props.dispatch(Todo.toggleChecked)} />
          <Button basic onClick={props.onRemove} size="mini">
            <Icon name="trash" />
          </Button>
        </List.Header>
      </List.Content>
    </>
  )
}