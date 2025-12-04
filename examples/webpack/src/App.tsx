import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex ">
      <h1 className="">LAS CSS : {count}</h1>
      <button className="" onClick={() => setCount(count + 1)}>
        count increment ++
      </button>
    </div>
  );
}
