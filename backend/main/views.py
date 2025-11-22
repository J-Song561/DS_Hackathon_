from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt  
from django.utils.decorators import method_decorator
import logging

from .utils import fetch_youtube_transcript
from .analyzer import analyze_video_complete

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class VideoHazardAnalyzeView(APIView):
    def post(self, request):
        # 1. URL 검증
        video_url = request.data.get('url')
        
        if not video_url:
            return Response(
                {"error": "URL을 감지할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"분석 대상 URL 감지: {video_url}")
        
        # 2. YouTube 대본 및 썸네일 가져오기
        try:
            transcript_data = fetch_youtube_transcript(video_url)
            
            if "error" in transcript_data:
                logger.warning(f"대본 추출 실패: {transcript_data['error']}")
                return Response(
                    {
                        "error": transcript_data["error"],
                        "url": video_url
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
        
        except Exception as e:
            logger.error(f"대본 추출 중 오류 발생: {e}", exc_info=True)
            return Response(
                {"error": "대본을 가져오는 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # 3. 대본 + 썸네일 통합 분석
        try:
            video_id = transcript_data.get("video_id")
            thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            
            analysis_result = analyze_video_complete(
                transcript=transcript_data.get("transcript", ""),
                thumbnail_url=thumbnail_url
            )
            
            logger.info(
                f"분석 완료: {transcript_data.get('video_id')} - "
                f"{analysis_result['hazard_level']} ({analysis_result['final_score']}점)"
            )
        
        except Exception as e:
            logger.error(f"분석 중 오류 발생: {e}", exc_info=True)
            return Response(
                {"error": "영상 분석 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # 4. 응답 데이터 구성
        response_data = {
            "url": video_url,
            "video_id": transcript_data.get("video_id"),
            "thumbnail_url": transcript_data.get("thumbnail_url"),
            "analysis": analysis_result
        }
        
        return Response(response_data, status=status.HTTP_200_OK)