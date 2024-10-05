import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import WalkDetail from "./components/walkDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 경로에서 Login을 렌더링 */}
        <Route path="/" element={<Login />} /> {/* Dashboard 경로 */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* detail 경로 */}
        <Route
          path="/walk-history/:walkHistoryId"
          element={<WalkDetail />}
        />{" "}
        {/* 라우팅 설정 */}
      </Routes>
    </Router>
  );
}

export default App;
