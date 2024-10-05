import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import { fetchWalkDetail, fetchEmotionData } from "../api"; // API 호출 함수 임포트
import "../styles/WalkDetail.css"; // CSS 파일을 임포트해 동그라미 스타일 적용

const WalkDetail = () => {
  const { walkHistoryId } = useParams(); // URL에서 walkHistoryId 받아옴
  const location = useLocation(); // Dashboard에서 넘겨준 walkHistoryId 리스트와 클릭한 날짜를 받음
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅 사용
  const [walkData, setWalkData] = useState(null);
  const [emotionData, setEmotionData] = useState(null); // 감정 데이터 상태 추가
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 인덱스 관리
  const walkHistoryIds = location.state?.walkHistoryIds || []; // 넘어온 walkHistoryIds 리스트
  const clickedDate = location.state?.clickedDate || ""; // Dashboard에서 넘겨받은 클릭한 날짜

  // 감정에 따른 색상 설정
  const emotionColors = {
    fear: "#48992C",
    surprised: "#287EFF",
    anger: "#EF281C",
    sadness: "#2A2096",
    neutral: "gray",
    joy: "#F5AF27",
    disgust: "#DB2B7F",
    None: "black",
  };

  // 영어 감정 -> 한글로 변환하는 매핑 객체
  const emotionTranslations = {
    fear: "공포",
    surprised: "놀람",
    anger: "분노",
    sadness: "슬픔",
    neutral: "모호",
    joy: "행복",
    disgust: "혐오",
    None: "기록 없음", // 감정 데이터가 없을 경우 처리
  };

  // emotion_large 값을 한글로 변환하는 함수
  function translateEmotion(emotion) {
    return emotionTranslations[emotion] || emotion; // 해당 감정이 없으면 원래 값 유지
  }

  // 현재 인덱스에 해당하는 walkHistoryId로 API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentWalkHistoryId = walkHistoryIds[currentIndex]; // 현재 인덱스의 walkHistoryId
        const response = await fetchWalkDetail(currentWalkHistoryId); // API 호출
        setWalkData(response.data); // WalkDetail API 응답 저장

        // 감정 데이터 호출
        const token = localStorage.getItem("token");
        const emotionResponse = await fetchEmotionData(clickedDate, token); // 감정 데이터 호출
        console.log("Emotion Data Response:", emotionResponse); // 감정 데이터 응답 확인
        setEmotionData(
          emotionResponse?.emotions || {
            emotion_large: "None",
            emotion_small: "기록 없음",
            sentence: "",
          }
        ); // 감정 데이터 없을 때 기본값 설정
      } catch (error) {
        console.error("API 호출 오류:", error);
      }
    };

    fetchData();
  }, [currentIndex, walkHistoryIds, clickedDate]);

  // 다음 walkHistoryId로 이동
  const handleNextClick = () => {
    if (currentIndex < walkHistoryIds.length - 1) {
      setCurrentIndex(currentIndex + 1); // 다음 인덱스로 이동
    }
  };

  // 이전 walkHistoryId로 이동 (옵션: 이전 버튼 구현)
  const handlePreviousClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1); // 이전 인덱스로 이동
    }
  };

  // 메인화면으로 이동
  const handleBackToMain = () => {
    navigate("/dashboard"); // "/dashboard" 경로로 이동 (Dashboard로 이동)
  };

  if (!walkData) {
    return <div>Loading...</div>; // 데이터가 로딩 중일 때
  }

  return (
    <div className="walk-detail-container">
      {/* 클릭한 날짜 표시 */}
      <h1>{clickedDate} 산책 기록</h1>
      {/* 감정 데이터를 표시하는 동그라미 */}
      <h2
        style={{
          color: emotionColors[emotionData?.emotion_large], // emotion_large에 따른 색상 설정
        }}
      >
        {translateEmotion(emotionData?.emotion_large)} {/* 한글로 감정 변환 */}
      </h2>
      <div
        className="emotion-circle"
        style={{
          backgroundColor: emotionColors[emotionData?.emotion_large], // emotion_large에 따른 색상 설정
          width: "100px", // 원의 크기 설정
          height: "100px", // 원의 크기 설정
          borderRadius: "50%", // 원으로 만들기 위해 반지름을 50%로 설정
          display: "flex", // 중앙 정렬을 위한 플렉스박스 설정
          justifyContent: "center", // 가로 가운데 정렬
          alignItems: "center", // 세로 가운데 정렬
          margin: "0 auto", // 부모 요소 내에서 가운데 정렬
        }}
      >
        <span
          className="emotion-small-text"
          style={{
            color: "white", // 텍스트 색상을 흰색으로 설정
            fontSize: "18px", // 글씨 크기 설정
            fontWeight: "bold", // 글씨 두께 설정
          }}
        >
          {emotionData?.emotion_small}
        </span>
      </div>

      {/* 감정의 sentence 표시 */}
      <p className="emotion-sentence">{emotionData?.sentence}</p>

      {/* UI 영역 추가 시작 */}
      <div className="walk-info-container">
        {/* 시작 시간과 종료 시간 */}
        <div className="time-container">
          <div className="start-time">
            <h4>산책 시작 ~ 종료 시간</h4>
            <p>
              {walkData.start_time} ~ {walkData.end_time}
            </p>
          </div>
        </div>

        {/* 총 산책 거리 및 시간 */}
        <div className="walk-info">
          <div className="distance">
            <p>총 산책 거리</p>
            <h2>{walkData.distance}</h2>
            <p>m</p>
          </div>
          <div className="walk-time">
            <p>총 산책 시간</p>
            <h2>{walkData.actual_walk_time}</h2>
            <p>분</p>
          </div>
        </div>

        {/* 안정도와 만족도 */}
        <div className="scores-container">
          <div className="stable-score">
            <p>산책 안정도</p>
            <h2>{walkData.stable_score}</h2>
            <div className="progress-bar">
              {/* 프로그래스 바 */}
              <div
                className="progress"
                style={{ width: `${walkData.stable_score}%` }}
              />
            </div>
          </div>
          <div className="walk-score">
            <p>산책 만족도</p>
            <div className="star-rating">
              {/* walk_score 값이 있을 때만 별을 표시 */}
              {"★".repeat(
                Math.max(0, Math.floor(walkData?.walk_score || 0))
              )}{" "}
              {/* 음수 방지 */}
              {"☆".repeat(
                Math.max(0, 5 - Math.floor(walkData?.walk_score || 0))
              )}{" "}
              {/* 음수 방지 */}
            </div>
            {/* walk_score가 null일 경우 기본값 0.0으로 처리 */}
            <p>
              {walkData?.walk_score != null
                ? walkData.walk_score.toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>
      </div>
      {/* UI 영역 추가 끝 */}

      {/* 이전 버튼: 첫 번째 인덱스가 아닌 경우에만 활성화 */}
      {currentIndex > 0 && <button onClick={handlePreviousClick}>이전</button>}

      {/* 다음 버튼: 마지막 인덱스가 아닌 경우에만 활성화 */}
      {currentIndex < walkHistoryIds.length - 1 && (
        <button onClick={handleNextClick}>다음</button>
      )}

      {/* 메인화면 버튼 추가 */}
      <button onClick={handleBackToMain}>메인화면</button>
    </div>
  );
};

export default WalkDetail;
