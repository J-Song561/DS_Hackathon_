// frontend/js/popup.js

document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "http://localhost:8000/api/analyze/transctipt/"; // main/urls.py 기준


  const wrapper = document.getElementById("popup-wrapper");
  const scoreEl = document.getElementById("score-display");
  const gradeEl = document.getElementById("grade-display");
  const messageEl = document.getElementById("message-display");
  const urlInput = document.getElementById("urlInput");
  const analyzeBtn = document.getElementById("analyzeBtn");


  function toKoreanGrade(level) {
    switch (level) {
      case "HIGH":
        return "위험";
      case "MEDIUM":
        return "주의";
      case "LOW":
        return "경미";
      case "NONE":
      default:
        return "안전";
    }
  }


  function applyStyleByLevel(level) {

    wrapper.classList.remove("grade-danger");
    scoreEl.style.color = "";
    gradeEl.style.color = "";

    if (level === "HIGH") {
      wrapper.classList.add("grade-danger");
      scoreEl.style.color = "red";
      gradeEl.style.color = "red";
    } else if (level === "MEDIUM") {
      scoreEl.style.color = "orange";
      gradeEl.style.color = "orange";
    } else if (level === "LOW") {
      scoreEl.style.color = "green";
      gradeEl.style.color = "green";
    } else {
      scoreEl.style.color = "#444";
      gradeEl.style.color = "#444";
    }
  }


  function renderResult(data) {
    // data = { url, video_id, analysis: {...} }
    const analysis = data.analysis || {};

    const level = analysis.hazard_level || "NONE"; // 예: HIGH / MEDIUM / LOW
    const score =
      analysis.total_score ??
      analysis.score ??
      "N/A"; 
    const summary =
      analysis.analysis_summary ||
      analysis.message ||
      "유해도 분석 요약을 불러오지 못했습니다.";

    scoreEl.innerText = `총점: ${score}점`;
    gradeEl.innerText = `등급: ${toKoreanGrade(level)}`;
    messageEl.innerText = summary;

    applyStyleByLevel(level);
  }


  if (typeof mockAnalysisResult !== "undefined") {
    renderResult(mockAnalysisResult);
  }


  analyzeBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();

    if (!url) {
      messageEl.innerText = "URL을 입력하세요!";
      return;
    }

    messageEl.innerText = "분석 중입니다...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }), // request.data.get('url') 로 받는 그 필드
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();
      console.log("백엔드 응답:", data); // 개발용 로그

      renderResult(data);
    } catch (error) {
      console.error(error);
      messageEl.innerText = "유해도 분석 요청 중 오류가 발생했습니다.";
    }
  });
});
