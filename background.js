// 메시지 수신, 백엔드 통신, 응답

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. 메시지 제목이 "ANALYZE_VIDEO"인지 확인
  if (message.type === "ANALYZE_VIDEO") {
    console.log("현장 요원으로부터 URL 수신:", message.url);
    
    // 2. 백엔드(Django) 서버에 '진짜' fetch 요청을 보내기
    // (비동기 처리를 위해 Promise/async 사용)
    const djangoApiUrl = "https://your-django-server.com/api/analyze/";
    
    fetch(djangoApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: message.url }) // { "url": "..." }
    })
    .then(response => response.json())
    .then(data => {
      // 3-1. 백엔드 응답 성공!
      console.log("백엔드로부터 분석 결과 수신:", data);
      sendResponse(data); // '현장 요원'에게 답장 전송
    })
    .catch(error => {
      // 3-2. 백엔드 응답 실패!
      console.error("백엔드 통신 에러:", error);
      sendResponse({ error: error.message }); // 에러 내용 답장
    });

    return true; 
  }
});