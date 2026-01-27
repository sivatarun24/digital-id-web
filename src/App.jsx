import { useState } from "react";
import './App.css'

function App() {
  const [count, setCount] = useState(0);

  function handleClick(buttonName) {
    setCount(count + 1);
    console.log(`Button clicked: ${buttonName}`);
  }

  return (
    <div className="App">
      <h1>My First React App</h1>

      <p>You clicked the button {count} times</p>

      <button onClick={() => handleClick('Click me')}>
        Click me
      </button>
      <button onClick={() => handleClick('Login')}>
        Login
      </button>
    </div>
  );
}

export default App;