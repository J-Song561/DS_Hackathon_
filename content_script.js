console.log("CS: WatchWise started!");

const API_URL = "http://localhost:8000/api/analyze/";

// Trigger on YouTube videos
if (location.href.includes("youtube.com/watch") || location.href.includes("youtube.com/shorts")) {
    console.log("CS: Analyzing video...");
    setTimeout(() => {
        requestAnalysisFromBackend(location.href);
    }, 2000);
}

async function requestAnalysisFromBackend(videoUrl) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: videoUrl })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log("CS: Analysis complete:", data);
        
        injectWarningBanner(data);
        
    } catch (error) {
        console.error("CS: Analysis failed:", error);
    }
}

function injectWarningBanner(data) {
    const old = document.getElementById('watchwise-banner');
    if (old) old.remove();

    const analysis = data.analysis || {};
    const level = analysis.hazard_level || "NONE";
    const score = analysis.final_score || analysis.total_score || 0;

    if (level === "LOW" || level === "NONE") {
        console.log("CS: Safe video, no banner needed");
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'watchwise-banner';
    
    // Color logic
    let bgColor, emoji, levelText;
    
    if (level === 'HIGH') {
        bgColor = '#DC2626';
        emoji = '🔴';
        levelText = '높은 위험';
    } else if (level === 'MEDIUM') {
        bgColor = '#EA580C';
        emoji = '🟠';
        levelText = '주의 필요';
    } else if (level === 'POSSIBLE') {
        bgColor = '#FBBF24';
        emoji = '🟡';
        levelText = '잠재적 위험';
    } else {
        bgColor = '#10B981';
        emoji = '🟢';
        levelText = '낮은 위험';
    }
    
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
            ${emoji} ${levelText}
        </div>
        <div style="font-size: 20px; margin-bottom: 10px;">
            총점: ${score}점
        </div>
        <div style="font-size: 14px; margin-bottom: 10px;">
            주의가 필요한 콘텐츠입니다.
        </div>
    `;
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
    `;
    
    // Details button
    const detailsBtn = document.createElement('button');
    detailsBtn.textContent = '자세히 보기';
    detailsBtn.style.cssText = `
        flex: 1;
        padding: 10px 20px;
        background: white;
        color: black;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
    `;
    
    detailsBtn.addEventListener('click', () => {
        // Save full data to storage
        chrome.storage.local.set({
            analysisData: data,
            videoUrl: location.href,
            timestamp: Date.now()
        }, () => {
            // Open details page in new tab
            chrome.runtime.sendMessage({ action: "openDetails" });
        });
    });
    
    detailsBtn.addEventListener('mouseenter', () => {
        detailsBtn.style.background = '#f3f4f6';
        detailsBtn.style.transform = 'scale(1.05)';
    });
    
    detailsBtn.addEventListener('mouseleave', () => {
        detailsBtn.style.background = 'white';
        detailsBtn.style.transform = 'scale(1)';
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '닫기';
    closeBtn.style.cssText = `
        padding: 10px 20px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid white;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
    `;
    
    closeBtn.addEventListener('click', () => banner.remove());
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.3)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
    });
    
    // Assemble
    buttonContainer.appendChild(detailsBtn);
    buttonContainer.appendChild(closeBtn);
    content.appendChild(buttonContainer);
    banner.appendChild(content);
    
    // Style banner
    banner.style.cssText = `
        position: fixed !important;
        top: 100px !important;
        right: 20px !important;
        background: ${bgColor} !important;
        color: white !important;
        padding: 20px !important;
        z-index: 2147483647 !important;
        font-size: 16px !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        width: 300px !important;
        font-family: Arial, sans-serif !important;
    `;
    
    document.body.appendChild(banner);
    console.log("CS: Warning banner displayed");
}