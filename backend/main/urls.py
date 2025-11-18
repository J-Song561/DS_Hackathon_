from django.urls import path
from django.contrib import admin
from .views import VideoHazardAnalyzeView
from .thumbnail_classifier import ThumbnailEncoder

urlpatterns = [ 
    path("admin/",admin.site.urls),
    path("analyze/transctipt/",VideoHazardAnalyzeView.as_view(), name = "transcript-analyzer"),
    path("analyze/thumbnail/",ThumbnailEncoder.as_view(), name="thumbnail-analyzer")
]

