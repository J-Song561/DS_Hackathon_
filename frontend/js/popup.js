// frontend/js/popup.js

document.addEventListener("DOMContentLoaded", function () {
  // 0. 백엔드 API 주소 (Django)
  // 실제로는 Django에서 /api/analyze/ 로 열려 있을 가능성이 큼
  const API_URL = "http://localhost:8000/api/analyze/"; // 필요하면 경로만 바꿔줘!

  // 1. 공통으로 쓸 요소들 찾아오기
  const wrapper = document.getElementById("popup-wrapper");
  const scoreEl = document.getElementById("score-display");
  const gradeEl = document.getElementById("grade-display");
  const messageEl = document.getElementById("message-display");
  const urlInput = document.getElementById("urlInput");
  const analyzeBtn = document.getElementById("analyzeBtn");

  // 2. 영어 레벨(HIGH/MEDIUM/LOW)을 한글 텍스트로 매핑
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

  // 3. 등급에 따라 스타일 적용
  function applyStyleByLevel(level) {
    // 초기화
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
      // NONE / 기타
      scoreEl.style.color = "#444";
      gradeEl.style.color = "#444";
    }
  }

  // 4. 화면에 점수/등급/메시지 뿌리는 함수
  function renderResult(data) {
    const level = data.hazard_level; // 백엔드에서 오는 값: HIGH / MEDIUM / LOW / NONE

    scoreEl.innerText = `총점: ${data.final_score ?? "N/A"}점`;
    gradeEl.innerText = `등급: ${toKoreanGrade(level)}`;
    messageEl.innerText =
      data.final_summary ??
      "유해도 분석 결과 요약을 불러오지 못했습니다.";

    applyStyleByLevel(level);
  }

  // 5. (선택) mock 데이터가 있으면 처음에 한 번 뿌려주기
  if (typeof mockAnalysisResult !== "undefined") {
    renderResult(mockAnalysisResult);
  }

  // 6. "유해도 검사" 버튼 눌렀을 때
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
        body: JSON.stringify({ url }), // Django REST APIView에서 request.data['url'] 로 받을 부분
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();
      console.log("백엔드 응답:", data);

      // 백엔드 응답 구조에 맞게 화면에 반영
      renderResult(data);
    } catch (error) {
      console.error(error);
      messageEl.innerText = "유해도 분석 요청 중 오류가 발생했습니다.";
    }
  });
});
