from django import views
from django.http import HttpResponse
from django.shortcuts import render
from .models import Song, Pattern, Sample
from .serializers import SongSerializer, PatternSerializer, SampleSerializer
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import status, views, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .groove import renderJSON

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class PatternViewSet(viewsets.ModelViewSet):
    queryset = Pattern.objects.all()
    serializer_class = PatternSerializer

class SampleViewSet(viewsets.ModelViewSet):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

class CreateUserView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            User.objects.create_user(**serializer.validated_data)

            user = authenticate(
              username=serializer.validated_data['username'],
              password=serializer.validated_data['password']
            )

            refresh = RefreshToken.for_user(user)

            return Response({
              'username': user.username,
              'id': user.id,
              'email': user.email,
              'token': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
              }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
  permission_classes = (AllowAny,)

  def post(self, request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is not None:
      refresh = RefreshToken.for_user(user)
      return Response({
         'username': user.username,
         'id': user.id,
         'email': user.email,
         'token': {
          'refresh': str(refresh),
          'access': str(refresh.access_token),
         }
      })
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class RenderView(views.APIView):
  permission_classes = (AllowAny,)

  def post(self, request):
    print(request.data)

    # Call renderJSON and get MP3 data as bytes
    mp3_data = renderJSON(request.data)

    # Create an HttpResponse with MP3 data
    response = HttpResponse(mp3_data, content_type='audio/mpeg')

    # Set the Content-Disposition header to suggest a filename for the download
    response['Content-Disposition'] = 'attachment; filename="rendered_audio.mp3"'

    print("Response:")
    print(response)

    return response

def index(request):
  return render(request, 'renderer/index.html')
