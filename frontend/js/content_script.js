// frontend/js/content_script.js

console.log("CONTENT SCRIPT EXECUTED!");

function isYoutubeShorts() {
  return location.pathname.startsWith("/shorts/");
}


function createWarningBanner(analysisData) {

  if (document.getElementById("yt-warning-banner")) return;

  const analysis = analysisData.analysis || {};
  const level = analysis.hazard_level || "NONE";
  const score = analysis.total_score ?? analysis.score ?? "N/A";
  const summary =
    analysis.analysis_summary ||
    analysis.message ||
    "유해도 분석 결과를 불러오지 못했습니다.";

  const banner = document.createElement("div");
  banner.id = "yt-warning-banner";

  if (level === "HIGH") {
    banner.classList.add("grade-danger");
  } else if (level === "MEDIUM") {
    banner.classList.add("grade-warn");
  }

  banner.innerHTML = `
    <div class="warning-header">
      <h4>
        <svg viewBox="0 0 24 24">
          <polygon points="12,2 22,20 2,20"></polygon>
          <line x1="12" y1="8" x2="12" y2="13"></line>
          <circle cx="12" cy="17" r="1"></circle>
        </svg>
        유해도 경고 (${score}점)
      </h4>
      <button id="warning-close-btn">×</button>
    </div>
    <div class="warning-body">
      <p><strong>등급:</strong> ${level}</p>
      <p>${summary}</p>
      <button id="warning-details-btn">상세 분석 보기</button>
      <div class="warning-details" id="warning-details-box">
        <!-- 나중에 키워드/타임스탬프 등 추가 가능 -->
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document
    .getElementById("warning-close-btn")
    .addEventListener("click", () => banner.remove());

  const detailsBtn = document.getElementById("warning-details-btn");
  const detailsBox = document.getElementById("warning-details-box");
  detailsBtn.addEventListener("click", () => {
    detailsBox.classList.toggle("show");
  });
}


function analyzeCurrentVideo() {
  if (!isYoutubeShorts()) {
    console.log("쇼츠 URL이 아님, 분석 스킵");
    return;
  }

  const currentUrl = location.href;
  console.log("쇼츠 URL 감지, 백엔드 분석 요청:", currentUrl);

  chrome.runtime.sendMessage(
    {
      type: "ANALYZE_VIDEO",
      url: currentUrl,
    },
    (response) => {
      if (!response || response.error) {
        console.error("분석 실패:", response && response.error);
        return;
      }
      console.log("분석 결과 수신:", response);
      createWarningBanner(response);
    }
  );
}

window.addEventListener("load", () => {
  analyzeCurrentVideo();
});
