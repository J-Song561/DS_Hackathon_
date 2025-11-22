// js/details.js

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['analysisData', 'videoUrl', 'timestamp'], (result) => {
      if (!result.analysisData) {
          console.log("No analysis data found, using mock data");
          if (typeof mockData !== 'undefined') {
              displayAnalysis(mockData, 'https://www.youtube.com/watch?v=example');
          } else {
              document.querySelector('.details-container').innerHTML = 
                  '<h1>데이터를 찾을 수 없습니다</h1><p>분석 데이터가 없습니다.</p>';
          }
          return;
      }

      displayAnalysis(result.analysisData, result.videoUrl);
  });
});

function displayAnalysis(data, videoUrl) {
  const analysis = data.analysis || {};
  
  // Video URL
  document.getElementById('video-url').textContent = videoUrl;
  const urlLink = document.getElementById('video-url');
  urlLink.innerHTML = `<a href="${videoUrl}" target="_blank">${videoUrl}</a>`;
  
  // Total score
  const totalScore = analysis.final_score || 0;
  document.getElementById('total-score').textContent = totalScore + '점';
  
  // Hazard level
  const level = analysis.hazard_level || 'NONE';
  const levelElement = document.getElementById('hazard-level');
  levelElement.textContent = getLevelText(level);
  levelElement.className = 'level-badge ' + level.toLowerCase();
  
  // Summary text
  document.getElementById('summary-text').textContent = getSummaryText(level);
  
  // Detail scores - ✅ analyzer.py의 실제 필드명 사용
  document.getElementById('title-score').textContent = 
      (analysis.thumbnail_score || 0) + '점';
  
  document.getElementById('script-score').textContent = 
      (analysis.transcript_score || 0) + '점';
  
  // ✅ 검출된 키워드 표시 (최상위 레벨의 keyword_matches에서)
  const topWordsList = document.getElementById('top-words-list');
  topWordsList.innerHTML = '';
  
  if (analysis.keyword_matches && Object.keys(analysis.keyword_matches).length > 0) {
      const keywordMatches = analysis.keyword_matches;
      const keywords = Object.keys(keywordMatches);
      
      // 키워드를 점수 기여도 순으로 정렬
      keywords.sort((a, b) => {
          return keywordMatches[b].score_contribution - keywordMatches[a].score_contribution;
      });
      
      keywords.forEach(keyword => {
          const match = keywordMatches[keyword];
          const li = document.createElement('li');
          li.innerHTML = `
              <strong>${keyword}</strong> 
              (${match.count}회 출현, ${match.level} 레벨, +${match.score_contribution}점)
          `;
          topWordsList.appendChild(li);
      });
  } else {
      topWordsList.innerHTML = '<li>검출된 키워드가 없습니다.</li>';
  }
}

function getLevelText(level) {
  const levels = {
      'HIGH': '🔴 높은 위험',
      'MEDIUM': '🟠 주의 필요',
      'POSSIBLE': '🟡 잠재적 위험',
      'LOW': '🟢 낮은 위험',
      'NONE': '✅ 안전'
  };
  return levels[level] || level;
}

function getSummaryText(level) {
  const summaries = {
      'HIGH': '이 영상은 높은 수준의 유해 콘텐츠를 포함하고 있을 가능성이 있습니다.',
      'MEDIUM': '이 영상은 일부 주의가 필요한 콘텐츠를 포함하고 있습니다.',
      'POSSIBLE': '이 영상은 잠재적으로 유해한 콘텐츠를 포함할 수 있습니다.',
      'LOW': '이 영상은 비교적 안전한 콘텐츠입니다.',
      'NONE': '이 영상은 안전한 콘텐츠입니다.'
  };
  return summaries[level] || '분석 결과를 확인할 수 없습니다.';
}