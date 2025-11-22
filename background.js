// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_VIDEO") {
    console.log("현장 요원으로부터 URL 수신:", message.url);

    const djangoApiUrl = "http://localhost:8000/api/analyze/transctipt/";

    fetch(djangoApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: message.url }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("백엔드로부터 분석 결과 수신:", data);
        sendResponse(data);
      })
      .catch((error) => {
        console.error("백엔드 통신 에러:", error);
        sendResponse({ error: error.message });
      });

    return true; // 비동기 응답 유지
  }
});
