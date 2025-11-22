// background.js

console.log("BG: WatchWise 본부 가동 시작!");

// =========================================================
// 1. SPA 감지 (URL 변경 시 현장 요원 깨우기)
// =========================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 페이지 로딩 완료 & URL 존재 시
    if (changeInfo.status === 'complete' && tab.url) {
        // 유튜브 롱폼 or 쇼츠 확인
        if (tab.url.includes("youtube.com/watch") || tab.url.includes("youtube.com/shorts")) {
            console.log(`BG: 새 영상 감지! [${tabId}]`);
            
            // 현장 요원에게 "일해라!" 신호 전송
            chrome.tabs.sendMessage(tabId, {
                type: "NEW_VIDEO_LOADED",
                url: tab.url
            }).catch(() => {
                // 탭이 닫혔거나 스크립트 로드 전이면 에러 무시
            });
        }
    }
});

// =========================================================
// 2. 백엔드 통신 (CORS 우회용 프록시)
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ANALYZE_VIDEO") {
        console.log("BG: 분석 요청 수신 -> 백엔드로 전달:", message.url);
        
        // ★ 백엔드 팀 설정에 맞춘 최종 URL
        const djangoApiUrl = "http://localhost:8000/api/analyze/"; 
        
        fetch(djangoApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: message.url })
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("BG: 백엔드 응답 수신 완료:", data);
            sendResponse(data); // 현장 요원에게 결과 토스
        })
        .catch(error => {
            console.error("BG: 백엔드 통신 실패:", error);
            sendResponse({ error: error.message });
        });

        return true; // 비동기 응답 유지를 위해 필수
    }
});