import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <>
      <h1 className="bg-red-900 text-white text-right py-5 md:bg-blue-500">
        asds + Weasdaasdasdk +asdsaasadsdasdaasdsadsdasdd Resadsadact asds +
        Weasdasdsadsack + Resadasdassada pack
      </h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
