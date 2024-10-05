import React, { useState } from "react";
import { login, fetchCalendar } from "../api"; // login과 fetchCalendar API 호출 함수 가져오기
import { useNavigate } from "react-router-dom"; // useNavigate 사용
import "../styles/Login.css"; // 스타일 파일
import logo from "../images/logo.png"; // 이미지 파일

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. 로그인 API 호출
      const response = await login({ username, password });
      const { token } = response.data; // 응답에서 토큰 추출
      if (!token) {
        throw new Error("Token not found in response");
      }

      // 2. 토큰을 localStorage에 저장
      localStorage.setItem("token", token);

      // 3. get-calendar API 자동 호출
      await fetchCalendar(token);

      // 4. Dashboard로 이동
      navigate("/dashboard");
    } catch (error) {
      setError("로그인 실패 정보를 다시 확인해 주세요");
    }
  };

  return (
    <div className="login-container">
      <h1>마음챙김 산책 서비스</h1>
      <div>
        <img
          src={logo}
          alt="logo"
          style={{
            width: "400px",
            marginRight: "70px",
          }}
        />
      </div>
      <h2>로그인</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input-field"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-field"
        />
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
