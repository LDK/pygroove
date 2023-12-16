from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('songs', views.SongViewSet)
router.register('patterns', views.PatternViewSet)
router.register('channels', views.ChannelViewSet)
router.register('stepsequences', views.StepSequenceViewSet)
router.register('samples', views.SampleViewSet)
router.register('filtersections', views.FilterSectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.CreateUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login')
]
