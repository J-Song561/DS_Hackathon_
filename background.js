console.log("코드 실행 확인용!!!");


// =========================================================
// 1. 탭 URL 변경 감지 (SPA 문제 해결)
// =========================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    
    // 1. 탭의 URL이 있고, 페이지 로딩이 '완료'되었는지 확인
    if (tab.url && changeInfo.status === 'complete') {
        
        // 2. 그 URL이 '유튜브 롱폼' 또는 '쇼츠' 페이지인지 확인
        if (tab.url.includes("youtube.com/watch") || tab.url.includes("youtube.com/shorts")) {
            
            console.log(`BG: 새 영상 페이지 감지! [${tabId}] - ${tab.url}`);
            
            // 3. '현장 요원'(content_script.js)에게 "일어나!" 메시지 전송
            chrome.tabs.sendMessage(tabId, {
                type: "NEW_VIDEO_LOADED", // 실행 신호
                url: tab.url
            }).catch(error => {
                // 현장 요원이 주입되지 않은 탭에서는 에러가 발생할 수 있습니다 (무시해도 됨)
                // console.warn("BG: 현장 요원에게 신호 전송 실패 (탭이 아직 준비 안됨)");
            });
        }
    }
});


// =========================================================
// 2. content_script의 분석 요청 처리
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // 메시지 제목이 "ANALYZE_VIDEO" (분석 요청)인지 확인
    if (message.type === "ANALYZE_VIDEO") {
        console.log("BG: 현장 요원으로부터 분석 요청 수신. 백엔드 연결 시작.");
        
        // 백엔드(Django) 서버 URL. (나중에 팀원이 설정할 URL로 교체해야 함)
        const djangoApiUrl = "https://your-django-server.com/api/analyze/";
        
        // fetch는 비동기 함수이므로, return true를 통해 응답을 기다립니다.
        fetch(djangoApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: message.url }) // { "url": "..." } 전송
        })
        .then(response => {
            if (!response.ok) {
                // HTTP 에러 상태 코드(4xx, 5xx) 처리
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("BG: 백엔드 분석 결과 수신 및 현장 요원에게 전달.");
            sendResponse(data); 
        })
        .catch(error => {
            console.error("BG: 백엔드 통신 에러 발생:", error);
            // 에러 발생 시, 에러 메시지를 프론트엔드에 전달
            sendResponse({ error: error.message || "알 수 없는 통신 에러" }); 
        });

        // 비동기 응답(fetch)을 처리하기 위해 true 반환 (필수!)
        return true; 
    }
    // 다른 메시지 타입은 무시하고, 기본적으로 false 반환
    return false;
});