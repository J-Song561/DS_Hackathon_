// frontend/js/content_script.js

console.log("CS: '현장 요원' 주입 완료. '본부'의 신호 대기 중...");

// ---------------------------------------------
// 1. '본부'(background.js)로부터 메시지를 받으면 실행!
// ---------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1-1. '본부'가 보낸 메시지 제목이 맞는지 확인
  if (message.type === "NEW_VIDEO_LOADED") {
    
    console.log("CS: '본부'로부터 신호 수신!", message.url);

    // 1-2. (가짜 데이터)
    // (나중에는 여기서 message.url을 다시 '본부'로 보내
    //  '진짜' 분석 데이터를 받아와야 합니다)
    const mockAnalysis = {
      riskLevel: '높음',
      summaryMessage: "이 영상은 '충격' 등 자극적인 단어를 3회 사용했습니다. 내용이 과장되었을 수 있으니 주의하세요.",
      issues: [
        { timestamp: '제목', text: '🔥 충격! 절대 클릭하지 마세요', reason: '자극적인 제목' },
        { timestamp: '0:15', text: '...정말 충격적인 소식입니다...', reason: '자극적인 단어 사용' }
      ]
    };
    
    // 1-3. 배너 주입 함수 실행
    // (페이지가 바뀌었을 수 있으니 1초 정도 여유를 줍니다)
    setTimeout(() => {
      injectWarningBanner(mockAnalysis);
    }, 500); // 0.5초
  }
});


// ---------------------------------------------
// 2. 배너 생성 및 주입 함수 (이전 코드와 거의 동일)
// ---------------------------------------------
function injectWarningBanner(data) {
  // --- 2-1. (매우 중요!) 새 영상이므로, 기존 배너가 있다면 싹 지운다 ---
  const existingBanner = document.getElementById("yt-warning-banner");
  if (existingBanner) {
    existingBanner.remove();
  }

  // --- 2-2. 배너 HTML '틀' 만들기 ---
  const banner = document.createElement('div');
  banner.id = "yt-warning-banner";
  
  let headerText = '';
  if (data.riskLevel === '높음') {
    banner.classList.add('grade-danger');
    headerText = '⚠️ 시청 주의';
  } else {
    banner.classList.add('grade-warn');
    headerText = '🟡 확인 필요';
  }

  const issuesHtml = data.issues.map(issue => `
    <div class="warning-issue">
      <p class="warning-issue-text">"${issue.text}"</p>
      <div class="warning-issue-reason">
        <span class="timestamp">${issue.timestamp}</span>
        🚨 ${issue.reason}
      </div>
    </div>
  `).join('');

  banner.innerHTML = `
    <div class="warning-header">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:18px; height:18px; stroke:#ef4444; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        ${headerText}
      </h4>
      <button id="warning-close-btn" title="닫기">&times;</button>
    </div>
    <div class="warning-body">
      <p>${data.summaryMessage}</p>
      <button id="warning-details-btn">이유 보기</button>
      <div class="warning-details">${issuesHtml}</div>
    </div>
  `;

  // --- 2-3. (⭐️) 롱폼/쇼츠 '주입 위치' 찾기 (이전과 동일) ---
  let injectionParent = null;

  const longFormPlayer = document.querySelector('#movie_player');
  if (longFormPlayer && longFormPlayer.parentElement) {
    injectionParent = longFormPlayer.parentElement;
  } 
  else {
    const shortsPlayer = document.querySelector('ytd-shorts[class*="ytd-page-manager"]');
    if (shortsPlayer) {
      injectionParent = shortsPlayer;
      banner.style.position = 'fixed';
      banner.style.top = '15px';
      banner.style.right = '15px';
    }
  }

  // --- 2-4. 찾은 위치에 '주입' ---
  if (injectionParent) {
    injectionParent.appendChild(banner);
    console.log("CS: ✅ 경고 배너 주입 성공!");
    addBannerEventListeners(banner);
  } else {
    console.error("CS: ❌ 배너를 주입할 위치를 찾지 못했습니다.");
  }
}

// ---------------------------------------------
// 3. 배너 내부 버튼 작동 함수 (이전 코드와 동일)
// ---------------------------------------------
function addBannerEventListeners(bannerElement) {
  const closeBtn = bannerElement.querySelector("#warning-close-btn");
  const detailsBtn = bannerElement.querySelector("#warning-details-btn");
  const detailsContent = bannerElement.querySelector(".warning-details");

  if(closeBtn) {
    closeBtn.addEventListener('click', () => {
      bannerElement.remove();
    });
  }
  
  if(detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      const isVisible = detailsContent.classList.toggle('show');
      detailsBtn.innerText = isVisible ? "숨기기" : "이유 보기";
    });
  }
}