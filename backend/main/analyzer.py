import re

# 유해성 판단 키워드
HAZARDOUS_KEYWORDS = {
    "level3": ["충격", "경악", "대참사"],
    "level2": ["논란", "분노", "파국"],
    "level1": ["안타까운 소식", "믿기 힘든"], 
}

# 위험 점수 기준, 유해 레벨 판단
SCORE_THRESHOLD = {
    "HIGH": 10,  
    "MEDIUM": 5,
    "LOW": 1,   
}

def analyze_transcript_for_hazard(transcript: str) -> dict:
    if not transcript:
        return {
            "is_hazardous": False,
            "total_score": 0,
            "hazard_level": "NONE",
            "keyword_matches": {},
            "analysis_summary": "대본 텍스트가 없어 분석을 수행할 수 없습니다."
        }

    total_score = 0
    match_results = {}
    processed_text = transcript.lower()


    for level, keywords in HAZARDOUS_KEYWORDS.items():
        score_weight = 0
        if level == "level3":
            score_weight = 3
        elif level == "level2":
            score_weight = 2
        elif level == "level1":
            score_weight = 1

        for keyword in keywords:
            #  각 단어 출현 횟수 계산
            matches = processed_text.count(keyword)
            
            if matches > 0:
                score_increase = matches * score_weight
                total_score += score_increase
                
                # 매칭된 키워드 정보 저장 (디버깅 및 상세 결과용)
                if keyword in match_results:
                    match_results[keyword]['count'] += matches
                else:
                    match_results[keyword] = {
                        "count": matches,
                        "weight": score_weight,
                        "level": level
                    }

    # 총 점수를 기반으로 유해성 레벨 결정
    hazard_level = "NONE"
    is_hazardous = False
    
    if total_score >= SCORE_THRESHOLD["HIGH"]:
        hazard_level = "HIGH"
        is_hazardous = True
    elif total_score >= SCORE_THRESHOLD["MEDIUM"]:
        hazard_level = "MEDIUM"
        is_hazardous = True
    elif total_score >= SCORE_THRESHOLD["LOW"]:
        hazard_level = "LOW"
        is_hazardous = True
        
    analysis_summary = f"총 {total_score}점 획득. 유해성 레벨은 '{hazard_level}'로 판정됨."

    return {
        "is_hazardous": is_hazardous,
        "total_score": total_score,
        "hazard_level": hazard_level,
        "keyword_matches": match_results,
        "analysis_summary": analysis_summary
    }