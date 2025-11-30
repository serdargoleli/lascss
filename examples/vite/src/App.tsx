import { useState } from "react";

function App() {
  const [deneme, setDeneme] = useState(1);

  return (
    <>
      <div className="bg-blue-900 text-red-100 ">
        @lssaddsas/vite psadsadluginsdssadssdsdsad
      </div>
      <button onClick={() => setDeneme(deneme + 1)}>{deneme}</button>
    </>
  );
}

export default App;
