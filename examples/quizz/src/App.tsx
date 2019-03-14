import React,{ useState } from 'react';
import {dispatcherFromReact} from "hydra-dispatch-react"
import logo from './logo.svg';
import './App.css';

interface State {
  name: string
}
const State: State ={
  name: ""
}

const setName = (name: string) => (state: State): State => ({
  ...state,
  name
})

const App = () => {
  const [state, setState] = useState(State)
  const dispatch = dispatcherFromReact(setState)
  return (
    <div className="App">
      <header className="App-header">
        <input type="text" 
               value={state.name} 
               onChange={evt => dispatch(setName(evt.target.value))}/>
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
          Learn React {state.name}
        </a>
      </header>
    </div>
  );
}

export default App;
