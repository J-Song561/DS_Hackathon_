from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound
from urllib.parse import urlparse, parse_qs

def get_video_id(url):  # YouTube URL에서 video ID 추출
    try:
        url_data = urlparse(url)
        query = parse_qs(url_data.query)
        if 'v' in query:
            return query['v'][0]
        # 짧은 URL (youtu.be) 처리
        if url_data.netloc == 'youtu.be':
            return url_data.path[1:]
        
        # 일반 URL 처리
        if url_data.path.startswith('/embed/'):
            return url_data.path.split('/embed/')[1]
        
    except Exception:
        return None
        
    return None

def fetch_youtube_transcript(video_url):  # 영상 대본 가져와 딕셔너리로 반환
    video_id = get_video_id(video_url)
    if not video_id:
        return {"error": "유효하지 않은 YouTube URL 또는 Video ID 입니다."}

    transcript_text = ""
    
    # 대본 가져오기
    try:
        # 사용 가능한 자막 목록 조회
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # 한국어 또는 영어 자막을 우선적으로 찾고, 없으면 사용 가능한 다른 자막을 찾기
        try:
            # 한국어 자막 시도
            transcript = transcript_list.find_transcript(['ko']).fetch()
        except NoTranscriptFound:
            try:
                # 없으면 영어 자막 시도
                transcript = transcript_list.find_transcript(['en']).fetch()
            except NoTranscriptFound:
                # 그 외 자막
                transcript = transcript_list.find_transcript(['ko', 'en', 'en-US', 'en-GB']).fetch()

        # 대본 텍스트를 하나로 합치기
        transcript_text = " ".join([item['text'] for item in transcript])
        
    except NoTranscriptFound:
        # 해당 영상에 자막 자체가 없는 경우
        print(f"Video ID {video_id} 에 대한 대본을 찾을 수 없습니다.")
        return {"error": "해당 영상의 대본을 찾을 수 없습니다."}
    except Exception as e:
        # 기타 오류 
        print(f"YouTube Transcript API 오류: {e}")
        return {"error": f"대본 추출 중 예기치 않은 오류 발생: {e}"}


    # 최종 결과 반환
    result = {
        "video_id": video_id,
        "transcript": transcript_text,
    }
    
    return result