import axios from "axios";

// Axios 인스턴스 생성
/*const api = axios.create({
  baseURL:
    "http://ec2-43-203-221-193.ap-northeast-2.compute.amazonaws.com/server", // Django 서버의 기본 경로
});*/

const api =
  window.location.hostname === "localhost"
    ? "http://ec2-43-203-221-193.ap-northeast-2.compute.amazonaws.com/server"
    : "api";

export const apiClient = axios.create({
  baseURL: api,
});

// 로그인 요청
export const login = (loginData) => api.post("/user-login/", loginData);

// get-calendar API 호출 (토큰 필요)
export const fetchCalendar = (token) => {
  return api.post(
    "/get-calendar/",
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
};

// walk-monthly-report API 호출 시 토큰을 헤더에 추가
export const fetchMonthlyWalks = (year, month, token) => {
  return api.get(`/walk-monthly-report/${year}/${month}/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
};

// 로그아웃 요청 (토큰 포함)
export const logout = (token) => {
  return api.post(
    "/user-logout/",
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
};

// walk-once-report API 호출 함수
export const fetchWalkDetail = (walkHistoryId) => {
  console.log(`Calling API at: /walk-once-report/${walkHistoryId}/`);
  return api.get(`/walk-once-report/${walkHistoryId}/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem("token")}`,
    },
  });
};

export const fetchEmotionData = async (todayDate) => {
  const token = localStorage.getItem("token");
  const response = await api.get(
    `/emotion-list-create/?todayDate=${todayDate}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return response.data; // 감정 데이터를 반환
};
