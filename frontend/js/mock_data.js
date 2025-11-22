// 백엔드 API가 최종적으로 줄 예정인 가짜 데이터
const mockAnalysisResult = {
  url: "https://www.youtube.com/shorts/xxxx",
  video_id: "xxxxxxx",
  analysis: {
    hazard_level: "HIGH", // HIGH / MEDIUM / LOW / NONE
    total_score: 85, // 유해도 총점 (0~100)
    analysis_summary: "자극적인 표현이 5회 이상 사용되었습니다.", // 요약 메시지

    // 상세 분석용 데이터 (추가 정보)
    title_score: 90, // 제목 자극도
    script_score: 80, // 스크립트 자극도
    top_words: ["충격", "경악", "결국", "파국", "논란"], // 주요 자극 단어
  },
};
