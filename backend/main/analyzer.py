from .thumbnail_classifier import thumbnail_classifier
from .transcript_analyzer import analyze_transcript_for_hazard  

# 썸네일 점수 가중치 (0 = 안전, 1 = 유해)
THUMBNAIL_WEIGHT = 5

def analyze_thumbnail(thumbnail_url: str) -> dict:
    """썸네일 이미지 분석"""
    if not thumbnail_url:
        return {
            "thumbnail_score": 0,
            "thumbnail_is_harmful": False,
            "thumbnail_confidence": 0.0,
            "thumbnail_probabilities": {},
            "thumbnail_summary": "썸네일 URL이 없어 분석을 수행할 수 없습니다."
        }
    
    try:
        result = thumbnail_classifier.predict(thumbnail_url)
        
        thumbnail_score = result['score'] * THUMBNAIL_WEIGHT
        is_harmful = result['score'] == 1
        
        summary = (
            f"썸네일 분석 결과: {'유해' if is_harmful else '안전'} "
            f"(신뢰도: {result['confidence']:.2%})"
        )
        
        return {
            "thumbnail_score": thumbnail_score,
            "thumbnail_is_harmful": is_harmful,
            "thumbnail_confidence": result['confidence'],
            "thumbnail_probabilities": result['probabilities'],
            "thumbnail_summary": summary
        }
    
    except Exception as e:
        return {
            "thumbnail_score": 0,
            "thumbnail_is_harmful": False,
            "thumbnail_confidence": 0.0,
            "thumbnail_probabilities": {},
            "thumbnail_summary": f"썸네일 분석 중 오류 발생: {str(e)}"
        }


def analyze_video_complete(transcript: str, thumbnail_url: str) -> dict:
    """대본 + 썸네일을 통합 분석하여 최종 유해성 판단"""
    
    # 1. 대본 분석 
    transcript_result = analyze_transcript_for_hazard(transcript)
    
    # 2. 썸네일 분석
    thumbnail_result = analyze_thumbnail(thumbnail_url)
    
    # 3. 최종 점수 계산
    final_score = transcript_result['total_score'] + thumbnail_result['thumbnail_score']
    
    # 4. 최종 유해성 레벨 결정
    SCORE_THRESHOLD = {
        "HIGH": 10,  
        "MEDIUM": 5,
        "LOW": 1,   
    }
    
    final_hazard_level = "NONE"
    final_is_hazardous = False
    
    if final_score >= SCORE_THRESHOLD["HIGH"]:
        final_hazard_level = "HIGH"
        final_is_hazardous = True
    elif final_score >= SCORE_THRESHOLD["MEDIUM"]:
        final_hazard_level = "MEDIUM"
        final_is_hazardous = True
    elif final_score >= SCORE_THRESHOLD["LOW"]:
        final_hazard_level = "LOW"
        final_is_hazardous = True
    
    # 5. 통합 분석 요약
    final_summary = (
        f"최종 점수: {final_score}점 (대본: {transcript_result['total_score']}점, "
        f"썸네일: {thumbnail_result['thumbnail_score']}점). "
        f"유해성 레벨: '{final_hazard_level}'"
    )
    
    return {
        "is_hazardous": final_is_hazardous,
        "final_score": final_score,
        "hazard_level": final_hazard_level,
        
        # 대본 분석 결과
        "transcript_score": transcript_result['total_score'],
        "transcript_hazard_level": transcript_result['hazard_level'],
        "keyword_matches": transcript_result['keyword_matches'],
        "transcript_summary": transcript_result['analysis_summary'],
        
        # 썸네일 분석 결과
        "thumbnail_score": thumbnail_result['thumbnail_score'],
        "thumbnail_is_harmful": thumbnail_result['thumbnail_is_harmful'],
        "thumbnail_confidence": thumbnail_result['thumbnail_confidence'],
        "thumbnail_probabilities": thumbnail_result['thumbnail_probabilities'],
        "thumbnail_summary": thumbnail_result['thumbnail_summary'],
        
        # 최종 요약
        "final_summary": final_summary
    }