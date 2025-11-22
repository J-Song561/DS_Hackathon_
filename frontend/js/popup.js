// frontend/js/popup.js

document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:8000/api/analyze/";  

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
      case "POSSIBLE":        
        return "의심";         
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
      scoreEl.style.color = "#DC2626";      // Red
      gradeEl.style.color = "#DC2626";
    } else if (level === "MEDIUM") {
      scoreEl.style.color = "#EA580C";      // Orange
      gradeEl.style.color = "#EA580C";
    } else if (level === "POSSIBLE") {      
      scoreEl.style.color = "#FBBF24";      // Yellow 
      gradeEl.style.color = "#FBBF24";
    } else if (level === "LOW") {
      scoreEl.style.color = "#10B981";      // Green
      gradeEl.style.color = "#10B981";
    } else {
      scoreEl.style.color = "#444";         // Gray
      gradeEl.style.color = "#444";
    }
  }

  function renderResult(data) {
    console.log("백엔드 응답:", data);
    
    const analysis = data.analysis || {};

    // Extract hazard level
    const level = analysis.hazard_level || "NONE";
    
    // Extract score
    const score = analysis.final_score ?? analysis.total_score ?? analysis.score ?? 0;
    
    // Extract summary
    let summary;
    if (level === "NONE") {
        summary = "안전한 콘텐츠입니다.";
    } else {
        // LOW, POSSIBLE, MEDIUM, HIGH
        summary = "주의가 필요한 콘텐츠입니다.";
    }

    // Update UI
    scoreEl.innerText = `총점: ${score}점`;
    gradeEl.innerText = `등급: ${toKoreanGrade(level)}`;
    messageEl.innerText = summary;

    applyStyleByLevel(level);
  }

  // Load mock data if available (for testing)
  if (typeof mockAnalysisResult !== "undefined") {
    renderResult(mockAnalysisResult);
  }

  // Main analyze button handler
  analyzeBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();

    if (!url) {
      messageEl.innerText = "URL을 입력하세요!";
      return;
    }

    // Disable button during analysis
    analyzeBtn.disabled = true;
    messageEl.innerText = "분석 중입니다...";
    scoreEl.innerText = "";
    gradeEl.innerText = "";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("백엔드 응답:", data);

      chrome.storage.local.set({ 'lastAnalysisResult': data }, () => {
        console.log('분석 결과 저장 완료');
      });

      renderResult(data);
      
    } catch (error) {
      console.error("분석 오류:", error);
      
      if (error.message.includes("Failed to fetch")) {
        messageEl.innerText = "서버에 연결할 수 없습니다. Django 서버가 실행 중인지 확인하세요.";
      } else {
        messageEl.innerText = `오류: ${error.message}`;
      }
      
      scoreEl.innerText = "";
      gradeEl.innerText = "";
      
    } finally {
      analyzeBtn.disabled = false;
    }
  });
});