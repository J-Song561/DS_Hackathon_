#임시로 붙여놓은 내용입니다 
from django.db import models

class VideoAnalysis(models.Model):
    """Store video analysis results"""
    video_id = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Video metadata
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    channel_name = models.CharField(max_length=200)
    
    # Scores
    final_score = models.FloatField()
    harmful_score = models.FloatField()
    reliability_score = models.FloatField()
    
    # Detailed breakdown (JSON)
    explanation = models.JSONField()
    
    # Metadata
    analyzed_at = models.DateTimeField(auto_now_add=True)
    view_count = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.video_id} - Score: {self.final_score}"


class UserSettings(models.Model):
    """User preferences"""
    user_id = models.CharField(max_length=100, unique=True)
    alert_threshold = models.FloatField(default=5.0)
    enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"User {self.user_id} - Threshold: {self.alert_threshold}"
