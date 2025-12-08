import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div className=" ">
      <button className="btn-primary">button</button>
    </div>
  );
}
