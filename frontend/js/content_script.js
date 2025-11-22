// frontend/js/content_script.js

console.log("CS: WatchWise 현장 요원 투입 완료.");

// =========================================================
// 1. 실행 트리거 (본부 신호 수신 OR 새로고침)
// =========================================================

// (A) 본부에서 "새 영상이다!" 신호가 오면 실행 (SPA 이동 시)
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "NEW_VIDEO_LOADED") {
        console.log("CS: [이동 감지] 분석 시작.");
        requestAnalysisFromBackend(message.url);
    }
});

// (B) 새로고침(F5) 직후 스스로 실행
if (location.href.includes("youtube.com/watch") || location.href.includes("youtube.com/shorts")) {
    console.log("CS: [초기 로드] 분석 시작.");
    requestAnalysisFromBackend(location.href);
}


// =========================================================
// 2. 백엔드 데이터 요청 함수
// =========================================================
function requestAnalysisFromBackend(videoUrl) {
    // 기존 배너 삭제 (중복 방지)
    removeExistingBanner();

    chrome.runtime.sendMessage(
        { type: "ANALYZE_VIDEO", url: videoUrl },
        (response) => {
            if (response && !response.error) {
                console.log("CS: ✅ 데이터 수신 성공!", response);
                injectWarningBanner(response); // 배너 생성 시작
            } else {
                console.error("CS: ❌ 분석 실패:", response);
            }
        }
    );
}

function removeExistingBanner() {
    const existing = document.getElementById("yt-warning-banner");
    if (existing) existing.remove();
}


// =========================================================
// 3. 배너 생성 및 주입 (UI 빌더)
// =========================================================
function injectWarningBanner(data) {
    removeExistingBanner();

    // ★ 백엔드 데이터 파싱 (Key 값 맞춤)
    const analysis = data.analysis || {};
    const level = analysis.hazard_level || "NONE"; // HIGH, MEDIUM, POSSIBLE, LOW
    const summary = analysis.final_summary || "분석 결과 없음";
    const keywords = analysis.keyword_matches || {};

    // 안전한 영상이면 배너 안 띄우기 (선택 사항)
    if (level === "LOW" || level === "NONE") {
        console.log("CS: 안전한 영상입니다. (배너 생략)");
        return;
    }

    // 등급별 스타일 설정
    const banner = document.createElement('div');
    banner.id = "yt-warning-banner";
    
    let headerText = '';
    let bannerClass = '';

    if (level === 'HIGH') {
        bannerClass = 'grade-danger';
        headerText = '⚠️ 높은 위험 감지';
    } else if (level === 'MEDIUM') {
        bannerClass = 'grade-warn';
        headerText = '🟠 주의 필요';
    } else {
        bannerClass = 'grade-warn';
        headerText = '🟡 잠재적 위험';
    }
    banner.classList.add(bannerClass);

    // 키워드 리스트 HTML 생성
    const issuesHtml = Object.entries(keywords).map(([word, info]) => `
        <div class="warning-issue">
            <p class="warning-issue-text">"${word}"</p>
            <div class="warning-issue-reason">
                🚨 ${info.count}회 발견 (심각도 ${info.level})
            </div>
        </div>
    `).join('');

    // 배너 HTML 조립
    banner.innerHTML = `
        <div class="warning-header">
            <h4>
                <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ${headerText}
            </h4>
            <button id="warning-close-btn" title="닫기">×</button>
        </div>
        <div class="warning-body">
            <p>${summary}</p>
            <button id="warning-details-btn">상세 분석 보기</button>
            <div class="warning-details">${issuesHtml}</div>
        </div>
    `;

    // 주입 위치 찾기 (롱폼 vs 쇼츠)
    let parent = null;
    const longPlayer = document.querySelector('#movie_player');
    const shortsPlayer = document.querySelector('ytd-shorts[class*="ytd-page-manager"]');

    if (longPlayer) {
        parent = longPlayer.parentElement || longPlayer;
    } else if (shortsPlayer) {
        parent = shortsPlayer;
        banner.style.position = 'fixed'; // 쇼츠는 고정 위치
        banner.style.top = '80px';     // 상단 여백 조정
        banner.style.right = '20px';
    }

    if (parent) {
        parent.appendChild(banner);
        addEventListeners(banner);
        console.log("CS: ✅ 배너 주입 완료.");
    }
}

// 이벤트 리스너 연결
function addEventListeners(banner) {
    banner.querySelector("#warning-close-btn").addEventListener('click', () => banner.remove());
    
    const detailsBtn = banner.querySelector("#warning-details-btn");
    const detailsDiv = banner.querySelector(".warning-details");
    
    detailsBtn.addEventListener('click', () => {
        const isShow = detailsDiv.classList.toggle('show');
        detailsBtn.innerText = isShow ? "접기" : "상세 분석 보기";
    });
}