from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('songs', views.SongViewSet)
router.register('samples', views.SampleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.CreateUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('render/', views.RenderView.as_view(), name='render'),
]
