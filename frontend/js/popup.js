document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. 가짜 데이터 가져오기 ---
    // (mock_data.js 파일에서 이미 선언된 변수)
    const data = mockAnalysisResult;

    // --- 2. HTML에서 'id'로 요소들 찾아오기 ---
    const wrapper = document.getElementById("popup-wrapper");
    const scoreEl = document.getElementById("score-display");
    const gradeEl = document.getElementById("grade-display");
    const messageEl = document.getElementById("message-display");

    // --- 3. 찾아온 요소에 데이터 '꽂아넣기' ---
    scoreEl.innerText = data.score + "점"; // "85점"
    gradeEl.innerText = data.grade;       // "위험"
    messageEl.innerText = data.message;   // "자극적인 표현이..."

    // --- 4. 데이터(등급)에 따라 CSS 스타일 동적으로 바꾸기 ---
    if (data.grade === "위험") {
        wrapper.classList.add("grade-danger"); // 빨간 테두리 CSS 적용
        scoreEl.style.color = "red"; // 점수도 빨간색으로
        gradeEl.style.color = "red"; // 등급도 빨간색으로
    } 
    // (else if 로 '주의' 등급일 때 로직도 추가하면 됨)
});