import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 추가
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchMonthlyWalks, fetchEmotionData } from "../api"; // 감정 데이터를 가져오는 API 추가
import Logout from "./Logout"; // 로그아웃 컴포넌트 추가
import "../styles/Dashboard.css";
import level1Img from "../images/level1.png";
import level2Img from "../images/level2.png";
import level3Img from "../images/level3.png";
import level4Img from "../images/level4.png";
import level5Img from "../images/level5.png";

// 차트 등록
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController
);

// 감정별 색상 정의
const emotionColors = {
  fear: "#48992C",
  surprised: "#287EFF",
  anger: "#EF281C",
  sadness: "#2A2096",
  neutral: "gray",
  joy: "#F5AF27",
  disgust: "#DB2B7F",
};

const Dashboard = ({ history }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [walkData, setWalkData] = useState(null);
  const [emotionData, setEmotionData] = useState({}); // 감정 데이터를 저장
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 사용

  useEffect(() => {
    const loadWalkData = async () => {
      const token = localStorage.getItem("token");
      setWalkData(null);
      const response = await fetchMonthlyWalks(year, month, token);
      setWalkData(response.data);
    };
    loadWalkData();
  }, [year, month]);

  // 날짜별 감정 데이터를 가져오는 함수
  const loadEmotionData = async (date) => {
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const token = localStorage.getItem("token");
    const response = await fetchEmotionData(formattedDate, token); // API 호출
    if (response && response.emotions) {
      setEmotionData((prev) => ({
        ...prev,
        [formattedDate]: response.emotions.emotion_large,
      })); // 날짜별 감정 데이터를 저장
    }
  };

  const isWalkDay = (date) => {
    if (!walkData) return false;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    return walkData?.emotion_analysis?.some(
      (walk) => walk.date === formattedDate && walk.walkhistory_id?.length > 0
    );
  };

  // 특정 날짜에 해당하는 walkhistory_id 리스트 가져오기
  const getWalkHistoryIds = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const walk = walkData?.emotion_analysis?.find(
      (entry) => entry.date === formattedDate
    );
    return walk?.walkhistory_id?.sort((a, b) => a - b) || []; // 정렬된 walkhistory_id 리스트 반환
  };

  // 타일 클릭 시 페이지 이동 함수
  const handleTileClick = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const walk = walkData?.emotion_analysis?.find(
      (entry) => entry.date === formattedDate
    );

    const walkHistoryIds = walk?.walkhistory_id || [];
    const selectedWalkHistoryId = walkHistoryIds[0];

    // 선택한 날짜의 emotionData 확인 (여기서 감정 데이터를 가져오는 로직)
    const emotion = emotionData[formattedDate]; // emotionData를 날짜에 맞게 가져옴

    if (selectedWalkHistoryId) {
      navigate(`/walk-history/${selectedWalkHistoryId}`, {
        state: {
          walkHistoryIds,
          clickedDate: formattedDate,
          emotionData: emotion, // emotionData를 WalkDetail로 전달
        },
      });
    }
  };

  // 캘린더 타일에 표시할 내용 결정 (동그라미 표시)
  const tileContent = ({ date, view }) => {
    if (view === "month" && isWalkDay(date)) {
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      // 감정 데이터가 없을 경우 해당 날짜에 대해 감정 데이터를 불러옴
      if (!emotionData[formattedDate]) {
        loadEmotionData(date);
      }

      const emotion = emotionData[formattedDate]; // 해당 날짜의 감정 데이터
      const color = emotion ? emotionColors[emotion] : "black"; // 감정에 맞는 색상을 가져옴

      return (
        <div
          className="highlight"
          onClick={() => handleTileClick(date)} // 클릭 이벤트 추가
          style={{ cursor: "pointer", color: color }} // 감정에 맞는 색상 적용
        >
          ●
        </div>
      );
    }
    return null;
  };

  // 산책 종료 시간을 기준으로 오름차순 정렬 (오래된 것이 앞에 오도록)
  const sortedStableScores =
    walkData?.stable_scores?.sort(
      (a, b) => new Date(a.end_time) - new Date(b.end_time)
    ) || [];

  // 최근 7개의 데이터를 유지하고 최신 데이터가 오른쪽으로 오도록 배열을 뒤집음
  const recentStableScores = sortedStableScores.slice(-7).reverse(); // 배열을 뒤집어서 최신 데이터가 오른쪽에 오도록

  // 차트 데이터 구성
  const chartData = {
    labels: recentStableScores.map((score) => score.date) || [], // 날짜가 차트의 X축 레이블로 사용됨
    datasets: [
      {
        label: "산책 안정도",
        data: recentStableScores.map((score) => score.stable_score) || [], // 산책 안정도 값
        borderColor: "#4caf50", // 차트 선 색상
        fill: false, // 차트 아래 채우기 해제
        tension: 0.1, // 곡선 부드럽게
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <header>
        <h2>{walkData?.nickname}님의 산책 기록</h2>
        {/* 선인장 레벨에 따라 이미지 표시 */}
        {walkData?.cactus_level === 1 && (
          <img src={level1Img} alt="레벨 1 선인장" />
        )}
        {walkData?.cactus_level === 2 && (
          <img src={level2Img} alt="레벨 2 선인장" />
        )}
        {walkData?.cactus_level === 3 && (
          <img src={level3Img} alt="레벨 3 선인장" />
        )}
        {walkData?.cactus_level === 4 && (
          <img src={level4Img} alt="레벨 4 선인장" />
        )}
        {walkData?.cactus_level === 5 && (
          <img src={level5Img} alt="레벨 5 선인장" />
        )}
        <p>선인장 레벨: {walkData?.cactus_level}</p>
        <p>선인장 현재 점수: {walkData?.cactus_score}</p>
        <Logout history={history} /> {/* 로그아웃 버튼 추가 */}
      </header>

      <main>
        <section className="summary-info">
          <div className="info-box">
            <p>누적 산책 거리: {walkData?.total_distance} km</p>
            <p>누적 산책 시간: {walkData?.total_time} 시간</p>
          </div>
          <div className="info-box">
            <p>최근 스트레스 지수: {walkData?.sri_score}</p>
            <p>(측정 날짜: {walkData?.sri_date})</p>
          </div>
        </section>

        {sortedStableScores.length > 0 ? (
          <section className="stable-score-chart">
            <h3>산책 안정도</h3>
            <Line data={chartData} />
          </section>
        ) : (
          <p>최신 안정도 데이터가 존재하지 않습니다.</p>
        )}

        <section className="calendar-container">
          <h3>{`${year}년 ${month}월`}</h3>
          <Calendar
            value={new Date(year, month - 1)} // 해당 월을 기본 값으로 설정
            tileContent={tileContent} // 타일에 동그라미 표시
            onActiveStartDateChange={({ activeStartDate }) => {
              setYear(activeStartDate.getFullYear());
              setMonth(activeStartDate.getMonth() + 1);
            }}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
