
from rest_framework.permissions import AllowAny

from renderer.serializers import SampleSerializer
from django.contrib.auth import authenticate
from renderer.models import Sample
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, viewsets

class SampleViewSet(viewsets.ModelViewSet):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

class SampleListSet(viewsets.ModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

class CreateSampleView(APIView):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

    def post(self, request, *args, **kwargs):
        serializer = SampleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SampleView(APIView):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

    def get(self, request, pk=None):
        sample = Sample.objects.get(pk=pk)
        serializer = SampleSerializer(sample)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk=None):
        sample = Sample.objects.get(pk=pk)
        serializer = SampleSerializer(sample, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
