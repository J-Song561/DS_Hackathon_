// background.js

console.log("BG: WatchWise 본부 가동 시작!");

// Helper function to extract video ID
function getVideoIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // Regular video: youtube.com/watch?v=VIDEO_ID
        const params = new URLSearchParams(urlObj.search);
        if (params.get('v')) {
            return params.get('v');
        }
        
        // Shorts: youtube.com/shorts/VIDEO_ID
        if (urlObj.pathname.startsWith('/shorts/')) {
            return urlObj.pathname.split('/shorts/')[1].split('?')[0];
        }
        
        // Embed: youtube.com/embed/VIDEO_ID
        if (urlObj.pathname.startsWith('/embed/')) {
            return urlObj.pathname.split('/embed/')[1].split('?')[0];
        }
        
    } catch (e) {
        console.error("BG: URL 파싱 오류:", e);
    }
    
    return null;
}

// =========================================================
// 1. SPA 감지 (URL 변경 시 현장 요원 깨우기)
// =========================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes("youtube.com/watch") || tab.url.includes("youtube.com/shorts")) {
            const videoId = getVideoIdFromUrl(tab.url);
            
            if (videoId) {
                console.log(`BG: 새 영상 감지! [${tabId}] Video ID: ${videoId}`);
                
                chrome.tabs.sendMessage(tabId, {
                    type: "NEW_VIDEO_LOADED",
                    url: tab.url
                }).catch(() => {
                    // 탭이 닫혔거나 스크립트 로드 전이면 에러 무시
                });
            } else {
                console.log("BG: Video ID를 추출할 수 없습니다:", tab.url);
            }
        }
    }
});

// =========================================================
// 2. 메시지 핸들러 (백엔드 통신 + Details 페이지 열기)
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // 2-1. 백엔드 분석 요청
    if (message.type === "ANALYZE_VIDEO") {
        console.log("BG: 분석 요청 수신 -> 백엔드로 전달:", message.url);
        
        // Validate video ID before sending
        const videoId = getVideoIdFromUrl(message.url);
        if (!videoId) {
            console.error("BG: 유효하지 않은 URL:", message.url);
            sendResponse({ error: "유효하지 않은 YouTube URL입니다." });
            return true;
        }
        
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
            sendResponse(data);
        })
        .catch(error => {
            console.error("BG: 백엔드 통신 실패:", error);
            sendResponse({ error: error.message });
        });

        return true; // Keep channel open for async response
    }
    
    // 2-2. Details 페이지 열기 요청
    if (message.action === "openDetails") {
        console.log("BG: Details 페이지 열기 요청 수신");
        chrome.tabs.create({
            url: chrome.runtime.getURL('frontend/details.html')
        }, (tab) => {
            console.log("BG: Details 페이지 열림, Tab ID:", tab.id);
        });
        return false; // No async response needed
    }
});

console.log("BG: 모든 리스너 등록 완료!");