import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl m-4 rounded-lg text-white bg-red-500 p-4">
        LAS CSS : {count}
      </h1>
      <button
        className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded"
        onClick={() => setCount(count + 1)}
      >
        count increment ++
      </button>
    </div>
  );
}
