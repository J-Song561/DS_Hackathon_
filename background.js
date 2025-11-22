// background.js

console.log("BG: 시작!");

// =========================================================
// 1. 탭 URL 변경 감지 (SPA 문제 해결 - 감시자)
// =========================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    
    // 탭 로딩이 완료되었고 URL이 있을 때
    if (changeInfo.status === 'complete' && tab.url) {
        
        // 유튜브 롱폼 또는 쇼츠 페이지인지 확인
        if (tab.url.includes("youtube.com/watch") || tab.url.includes("youtube.com/shorts")) {
            
            console.log(`BG: 새 영상 페이지 감지! [${tabId}] - ${tab.url}`);
            
            // '현장 요원'(content_script.js)에게 실행 신호 전송
            chrome.tabs.sendMessage(tabId, {
                type: "NEW_VIDEO_LOADED",
                url: tab.url
            }).catch(error => {
                // 아직 스크립트가 주입되지 않은 탭일 수 있음 (무시 가능)
                // console.log("BG: 아직 신호를 받을 준비가 안 됨");
            });
        }
    }
});

// =========================================================
// 2. 분석 요청 처리 (통신병)
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.type === "ANALYZE_VIDEO") {
        console.log("BG: 현장 요원으로부터 분석 요청 수신:", message.url);
        
        // ★ 로컬 테스트용 Django 서버 주소로 통일했습니다.
        const djangoApiUrl = "http://localhost:8000/api/analyze/transctipt/"; 
        
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
            console.log("BG: 백엔드 결과 수신 완료:", data);
            sendResponse(data); 
        })
        .catch(error => {
            console.error("BG: 백엔드 통신 실패:", error);
            sendResponse({ error: error.message });
        });

        return true; // 비동기 응답 유지 필수
    }
});