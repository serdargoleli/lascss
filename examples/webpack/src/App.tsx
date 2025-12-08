import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div className=" ">
      <button className="btn-primary" onClick={() => setCount(count + 1)}>
        <span className="btn-primary-text">count</span>
      </button>
    </div>
  );
}
