// frontend/js/details.js

// HTML이 다 로딩된 후에 실행되도록 감싸줍니다.
document.addEventListener("DOMContentLoaded", () => {
    
    // mock_data.js에서 데이터를 가져옵니다.
    // (mock_data.js가 HTML에서 먼저 로드되어야 함)
    const data = mockAnalysisResult;

    const videoUrlEl = document.getElementById("video-url");
    const totalScoreEl = document.getElementById("total-score");
    const hazardLevelEl = document.getElementById("hazard-level");
    const summaryTextEl = document.getElementById("summary-text");
    const titleScoreEl = document.getElementById("title-score");
    const scriptScoreEl = document.getElementById("script-score");
    const topWordsListEl = document.getElementById("top-words-list");

    const analysis = data.analysis;

    // 데이터 채워 넣기
    videoUrlEl.textContent = data.url;
    totalScoreEl.textContent = analysis.total_score + "점";
    
    // 등급 표시 (영어 -> 한글 변환 로직 추가하면 더 좋음)
    hazardLevelEl.textContent = analysis.hazard_level;
    
    summaryTextEl.textContent = analysis.analysis_summary;
    titleScoreEl.textContent = analysis.title_score + "점";
    scriptScoreEl.textContent = analysis.script_score + "점";

    // 자주 등장한 단어 리스트 만들기
    analysis.top_words.forEach((word) => {
      const li = document.createElement("li");
      li.textContent = word;
      topWordsListEl.appendChild(li);
    });
});