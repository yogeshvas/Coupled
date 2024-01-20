import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login";
import { useState } from "react";
import ChooseLink from "./Pages/dashboard/ChooseLink";
import Room from "./Pages/dashboard/Room";

function App() {
  const [user, setUser] = useState(null);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <ChooseLink user={user} />
            ) : (
              <Login user={user} setUser={setUser} />
            )
          }
        />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  );
}

export default App;
