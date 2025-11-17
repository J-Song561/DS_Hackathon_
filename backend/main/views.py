from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json

from .utils import fetch_youtube_transcript 
from .analyzer import analyze_transcript_for_hazard

class VideoHazardAnalyzeView(APIView):
    def post(self, request):
        video_url = request.data.get('url')
        
        if not video_url:
            return Response(
                {"error": "요청 본문에 'url' 필드가 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transcript_data = fetch_youtube_transcript(video_url)
        
        if "error" in transcript_data:
            return Response(
                {"error": transcript_data["error"], "url": video_url},
                status=status.HTTP_404_NOT_FOUND 
            )
        
        transcript = transcript_data.get("transcript", "")
        
        analysis_result = analyze_transcript_for_hazard(transcript)
        
        response_data = {
            "url": video_url,
            "video_id": transcript_data.get("video_id"),  
            "analysis": analysis_result,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)