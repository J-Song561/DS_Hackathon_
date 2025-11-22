// frontend/js/popup.js

document.addEventListener("DOMContentLoaded", function () {
  //공통으로 쓸 요소들 찾아오기
  const wrapper = document.getElementById("popup-wrapper");
  const scoreEl = document.getElementById("score-display");
  const gradeEl = document.getElementById("grade-display");
  const messageEl = document.getElementById("message-display");
  const urlInput = document.getElementById("urlInput");
  const analyzeBtn = document.getElementById("analyzeBtn");

  // 등급에 따라 스타일 적용
  function applyStyleByGrade(grade) {
    // 일단 초기화
    wrapper.classList.remove("grade-danger");
    scoreEl.style.color = "";
    gradeEl.style.color = "";

    if (grade === "위험") {
      wrapper.classList.add("grade-danger");
      scoreEl.style.color = "red";
      gradeEl.style.color = "red";
    }
    // 필요하면 주의 등 다른 등급 스타일도 여기서 분기
  }

  // 화면에 점수/등급/메시지 뿌리는 함수
  function renderResult(data) {
    scoreEl.innerText = (data.score ?? "N/A") + "점";
    gradeEl.innerText = data.grade ?? "등급 정보 없음";
    messageEl.innerText = data.message ?? "";
    applyStyleByGrade(data.grade);
  }

  // 1) 페이지가 처음 열렸을 때 mock 데이터가 있으면 그걸로 채워서 미리보기
  if (typeof mockAnalysisResult !== "undefined") {
    renderResult(mockAnalysisResult);
  }

  // 2) "유해도 검사" 버튼 눌렀을 때
  analyzeBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();

    if (!url) {
      messageEl.innerText = "URL을 입력하세요!";
      return;
    }

    messageEl.innerText = "분석 중입니다...";

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json()
        
      renderResult(data);
    } catch (error) {
      console.error(error);
      messageEl.innerText = "유해도 분석 요청 중 오류가 발생했습니다.";
    }
  });
});
