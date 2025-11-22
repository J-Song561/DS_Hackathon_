from typing import Dict, Any
from .thumbnail_classifier import thumbnail_classifier
from .transcript_analyzer import analyze_transcript_for_hazard
from .config import SCORE_THRESHOLD


# 대본 분석 결과와 썸네일 분석 결과를 합산하여 최종 유해성 판단  
def analyze_video_complete(transcript: str, thumbnail_url: str) -> Dict[str, Any]:
    
    transcript_result = analyze_transcript_for_hazard(transcript)
    thumbnail_result = thumbnail_classifier.predict(thumbnail_url)
    
    # 점수 합산 
    final_score = transcript_result['total_score'] + thumbnail_result['score']
    
    # 최종 유해성 레벨 결정
    final_is_hazardous = False
    final_hazard_level = "NONE"
    
    if final_score >= SCORE_THRESHOLD["HIGH"]:
        final_hazard_level = "HIGH"
        final_is_hazardous = True
    elif final_score >= SCORE_THRESHOLD["MEDIUM"]:
        final_hazard_level = "MEDIUM"
        final_is_hazardous = True
    elif final_score >= SCORE_THRESHOLD["POSSIBLE"]:
        final_hazard_level = "POSSIBLE"
        final_is_hazardous = False
    elif final_score >= SCORE_THRESHOLD["LOW"]:
        final_hazard_level = "LOW"
        final_is_hazardous = False
    
    # 통합 분석 요약문 
    final_summary = (
        f"최종 점수: {final_score}점 (대본: {transcript_result['total_score']}점, "
        f"썸네일: {thumbnail_result['score']}점). "
        f"유해성 레벨: '{final_hazard_level}'"
    )
    
    return {
        # 최종 판정 결과 
        "is_hazardous": final_is_hazardous,
        "final_score": final_score,
        "hazard_level": final_hazard_level,
        
        # 근거1 - 대본 분석 결과
        "transcript_score": transcript_result['total_score'],
        "keyword_matches": transcript_result['keyword_matches'],
        "transcript_summary": transcript_result['analysis_summary'],
        
        # 근거2 - 썸네일 분석 결과
        "thumbnail_score": thumbnail_result['score'],
        "thumbnail_confidence": thumbnail_result['confidence'],
        "thumbnail_probabilities": thumbnail_result['probabilities'],
        
        "final_summary": final_summary
    }