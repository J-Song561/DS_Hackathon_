from django.urls import path
from django.contrib import admin
from .views import VideoHazardAnalyzeView

urlpatterns = [
    path("analyze/", VideoHazardAnalyzeView.as_view(), name="video-analyzer"),
]
