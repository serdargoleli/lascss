import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  return (
    <>
      <h1 className="text-white outline-2 outline-red-500 outline-offset-3 text-center m-5 p-5 rounded-lg  shadow-black bg-red-400">
        LAS CSS / WEBPACK PLUGIN
      </h1>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
