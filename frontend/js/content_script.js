// frontend/js/content_script.js

// 1. 초기화: '현장 요원' 주입 완료 로그
console.log("CS: '현장 요원' 주입 완료. '본부'의 신호 대기 중...");


// =========================================================
// 1. 메시지 수신 및 실행 블록 (SPA 트리거)
// =========================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // '본부'로부터 '새 영상 로드' 신호를 받으면 실행
    if (message.type === "NEW_VIDEO_LOADED") {
        
        console.log("CS: '본부'로부터 신호 수신! 분석 시작.");

        // 1-1. (가짜 데이터) - 백엔드가 완성되면 이 부분을 API 호출 로직으로 바꿉니다.
        const mockAnalysis = {
            riskLevel: '높음', // '높음' 또는 '주의'
            summaryMessage: "이 영상은 '충격' 등 자극적인 단어를 3회 사용했습니다. 내용이 과장되었을 수 있으니 주의하세요.",
            issues: [
                { timestamp: '제목', text: '🔥 충격! 절대 클릭하지 마세요', reason: '자극적인 제목' },
                { timestamp: '0:15', text: '...정말 충격적인 소식입니다...', reason: '자극적인 단어 사용' }
            ]
        };
        
        // 1-2. 배너 주입 함수 실행
        // (페이지 내용이 완전히 로드될 때까지 약간의 여유를 줍니다)
        setTimeout(() => {
            injectWarningBanner(mockAnalysis);
        }, 500);
        
        // (참고: API 호출 로직을 넣을 때 이 sendResponse를 써서 '본부'에 응답해야 합니다.)
    }
});


// =========================================================
// 2. 배너 생성 및 주입 함수 (UI 빌더)
// =========================================================
function injectWarningBanner(data) {
    // --- 2-1. (중요!) 새 영상이므로, 기존 배너가 있다면 싹 지운다 ---
    const existingBanner = document.getElementById("yt-warning-banner");
    if (existingBanner) {
        existingBanner.remove();
    }

    // --- 2-2. 헤더 및 클래스 설정 ---
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

    // --- 2-3. 상세 분석 내용 HTML로 변환 ---
    const issuesHtml = data.issues.map(issue => `
        <div class="warning-issue">
            <p class="warning-issue-text">"${issue.text}"</p>
            <div class="warning-issue-reason">
                <span class="timestamp">${issue.timestamp}</span>
                🚨 ${issue.reason}
            </div>
        </div>
    `).join('');

    // --- 2-4. 배너의 '내용물' 채우기 ---
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

    // --- 2-5. (⭐️제일 중요⭐️) 롱폼/쇼츠 '주입 위치' 찾기 ---
    let injectionParent = null;
    const longFormPlayer = document.querySelector('#movie_player');
    const shortsPlayer = document.querySelector('ytd-shorts[class*="ytd-page-manager"]');

    if (longFormPlayer && longFormPlayer.parentElement) {
        injectionParent = longFormPlayer.parentElement;
    } else if (shortsPlayer) {
        injectionParent = shortsPlayer;
        // 쇼츠는 스크롤되므로, 배너 위치를 'fixed'로 강제합니다.
        banner.style.position = 'fixed';
        banner.style.top = '15px';
        banner.style.right = '15px';
    }

    // --- 2-6. 찾은 위치에 '주입' 및 이벤트 연결 ---
    if (injectionParent) {
        injectionParent.appendChild(banner);
        console.log("CS: ✅ 경고 배너 주입 성공!");
        addBannerEventListeners(banner);
    } else {
        console.error("CS: ❌ 배너를 주입할 위치(#movie_player 또는 ytd-shorts)를 찾지 못했습니다.");
    }
}


// =========================================================
// 3. 배너 내부 버튼 작동 함수 (이전 코드와 동일)
// =========================================================
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