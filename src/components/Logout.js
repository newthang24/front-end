import { useNavigate } from "react-router-dom";
import { logout } from "../api";

function Logout() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token"); // 저장된 토큰 가져오기
      if (!token) {
        console.error("No token found for logout.");
        return;
      }

      await logout(token); // 로그아웃 요청

      // localStorage에서 토큰 삭제
      localStorage.removeItem("token");

      // 로그아웃 후 로그인 페이지로 리다이렉트
      navigate("/"); // useNavigate를 통해 리다이렉트
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
