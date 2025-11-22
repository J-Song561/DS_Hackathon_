console.log("코드 실행 확인용!!!");
// background.js

// =========================================================
// 1. 탭 URL 변경 감지 (SPA 문제 해결)
// =========================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 1. 탭의 URL이 있고, 페이지 로딩이 '완료'되었는지 확인
  if (tab.url && changeInfo.status === "complete") {
    // 2. 그 URL이 '유튜브 롱폼' 또는 '쇼츠' 페이지인지 확인
    if (
      tab.url.includes("youtube.com/watch") ||
      tab.url.includes("youtube.com/shorts")
    ) {
      console.log(`BG: 새 영상 페이지 감지! [${tabId}] - ${tab.url}`);

      // 3. content_script.js에 "NEW_VIDEO_LOADED" 메시지 전송
      try {
        chrome.tabs.sendMessage(
          tabId,
          {
            type: "NEW_VIDEO_LOADED",
            url: tab.url,
          },
          () => {
            // content_script가 아직 주입되지 않은 경우 오류가 날 수 있음 (무시)
            if (chrome.runtime.lastError) {
              // console.warn("BG: 현장 요원에게 신호 전송 실패:", chrome.runtime.lastError.message);
            }
          }
        );
      } catch (e) {
        // sendMessage 자체에서 예외가 나도 확장 죽지 않도록 보호
        // console.error("BG: sendMessage 예외:", e);
      }
    }
  }
});

// =========================================================
// 2. content_script의 분석 요청 처리
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 메시지 타입이 "ANALYZE_VIDEO" (분석 요청)인지 확인
  if (message.type === "ANALYZE_VIDEO") {
    console.log("BG: 현장 요원으로부터 분석 요청 수신. 백엔드 연결 시작.");
    console.log("현장 요원으로부터 URL 수신:", message.url);

    // TODO: 실제 사용하는 백엔드 URL로 수정해서 사용
    // (원래 코드에 있던 localhost 버전 사용)
    const djangoApiUrl =
      "http://localhost:8000/api/analyze/transctipt/"; 
    // ※ 백엔드 엔드포인트가 transcript면 철자를 맞춰서 바꿔줘도 됨

    fetch(djangoApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: message.url }), // { "url": "..." } 전송
    })
      .then((response) => {
        if (!response.ok) {
          // HTTP 에러 상태 코드(4xx, 5xx) 처리
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("BG: 백엔드 분석 결과 수신 및 현장 요원에게 전달:", data);
        sendResponse(data); // content_script로 결과 전달
      })
      .catch((error) => {
        console.error("BG: 백엔드 통신 에러 발생:", error);
        // 에러 발생 시, 에러 메시지를 프론트엔드에 전달
        sendResponse({ error: error.message || "알 수 없는 통신 에러" });
      });

    // fetch 비동기 응답을 위해 true 반환 (메시지 채널 유지)
    return true;
  }

  // 다른 메시지 타입은 처리하지 않음
  return false;
});
