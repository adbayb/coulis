import React from "react";
import { css } from "coulis";

function App() {
  return (
    <div className="App">
      <header
        className={css({
          flex: 1,
          backgroundColor: "lightcoral",
          color: {
            default: "blue",
            ":hover": "red",
          },
        })}
      >
        <p className={css({
          color: "blue"
        })}>
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
      </header>
    </div>
  );
}

export default App;
