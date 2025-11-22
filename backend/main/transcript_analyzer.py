from typing import Dict, Any
from .config import HAZARDOUS_KEYWORDS, KEYWORDS_WEIGHTS


def analyze_transcript_for_hazard(transcript: str) -> Dict[str, Any]:
    if not transcript or not transcript.strip():
        return {
            "total_score": 0,
            "keyword_matches": {},
            "analysis_summary": "대본 텍스트가 없어 분석을 수행할 수 없습니다."
        }

    total_score = 0
    match_results = {}

    # 각 레벨의 키워드를 검사
    for level, keywords in HAZARDOUS_KEYWORDS.items():
        score_weight = KEYWORDS_WEIGHTS[level]
        
        for keyword in keywords:
            # 키워드 출현 횟수 계산
            matches = transcript.count(keyword)
            
            if matches > 0:
                score_increase = matches * score_weight
                total_score += score_increase
                
                # 매칭된 키워드 정보 저장
                match_results[keyword] = {
                    "count": matches,
                    "weight": score_weight,
                    "level": level,
                    "score_contribution": score_increase
                }

    # 분석 요약
    analysis_summary = f"대본 분석 완료: 총 {total_score}점 ({len(match_results)}개 키워드 감지)"

    return {
        "total_score": total_score,
        "keyword_matches": match_results,
        "analysis_summary": analysis_summary
    }