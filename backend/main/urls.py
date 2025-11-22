from django.urls import path
from django.contrib import admin
from .views import VideoHazardAnalyzeView

urlpatterns = [ 
    path("admin/", admin.site.urls),
    path("api/analyze/", VideoHazardAnalyzeView.as_view(), name="video-analyzer"),
]