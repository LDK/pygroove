
from rest_framework.permissions import AllowAny

from renderer.serializers import UserSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from renderer.models import Song

class UserView(APIView):
    def get(self, request):
        return Response({
          'username': request.user.username,
          'id': request.user.id,
          'email': request.user.email,
        })

class UserSongsView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
          return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        songs = Song.objects.filter(user=request.user)

        return Response([{
          'id': song.id,
          'title': song.title,
          'author': song.author,
          'bpm': song.bpm,
        } for song in songs])

class RefreshTokenView(TokenRefreshView):
    permission_classes = (AllowAny,)

class CreateUserView(APIView):
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

class LoginView(APIView):
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

