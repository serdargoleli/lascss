import { useState } from "react";
function App() {
  const [deneme, setDeneme] = useState(1);

  return (
    <div className="p-3">
      <div className="bg-green-500 text-center text-white  mb-3 p-4 rounded-lg">denem</div>
      <button className="btn-primary" onClick={() => setDeneme(deneme + 1)}>
        LAS primary Button
      </button>
    </div>
  );
}

export default App;
