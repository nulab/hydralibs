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
