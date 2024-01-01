
import base64
from os import curdir, rename
from rest_framework.permissions import AllowAny

from renderer.waveform import Waveform
from renderer.serializers import SampleSerializer
from django.contrib.auth import authenticate
from renderer.models import Sample
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, viewsets
from os.path import join as pjoin

from django.conf import settings

class SampleViewSet(viewsets.ModelViewSet):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({
          'username': request.user.username,
          'id': request.user.id,
          'email': request.user.email,
        })

class SampleListSet(viewsets.ModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        output = []

        for sample in queryset:
            serializer = self.get_serializer(sample)
            waveform_image = sample.waveform

            sample_output = {
                'id': serializer.data['id'],
                'filename': serializer.data['filename'],
                'display': serializer.data['display'],
                'waveform': None,
            }

            if waveform_image.name:  # Check if the image field has a file associated with it
                try:
                    # Construct the URL for the waveform image
                    waveform_url = (request.build_absolute_uri(settings.STATIC_URL) + waveform_image.name).replace('/./waveform', '')
                    sample_output['waveform'] = waveform_url
                except IOError:
                    # Handle the case where the image file does not exist or cannot be opened
                    print("Error opening waveform image for sample id:", sample.id)
                    sample_output['waveform'] = None

            output.append(sample_output)

        return Response(output)

def saveSampleImage(data):
    fName = data['filename']
    fLoc = pjoin("./audio", fName)
    imgLoc = pjoin("./waveform", fName.replace('.wav','.png'))
    waveImg = Waveform(fLoc).save()

    rename(waveImg,imgLoc)
    return { "location": imgLoc, "image": imgLoc }


class CreateSampleView(APIView):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

    def post(self, request, *args, **kwargs):
        serializer = SampleSerializer(data=request.data)

        if serializer.is_valid():
            imgData = saveSampleImage(request.data)
            serializer.save(waveform=imgData['image'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SampleView(APIView):
    permission_classes = (AllowAny,)
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

    def get(self, request, pk=None):
        sample = Sample.objects.get(pk=pk)
        serializer = SampleSerializer(sample)
        waveform_image = sample.waveform

        output = {
            'id': serializer.data['id'],
            'filename': serializer.data['filename'],
            'display': serializer.data['display'],
            'waveform': None,
        }

        if waveform_image.name:  # Check if the image field has a file associated with it
            try:
                with waveform_image.open('rb') as image_file:
                    base64_encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    output['waveform'] = base64_encoded_image
            except IOError:
                # Handle the case where the image file does not exist or cannot be opened
                print("Error opening waveform image for sample id:", pk)
                output['waveform'] = None
        
        return Response(output, status=status.HTTP_200_OK)

    def put(self, request, pk=None):
        sample = Sample.objects.get(pk=pk)
        serializer = SampleSerializer(sample, data=request.data)
        if serializer.is_valid():
            imgData = saveSampleImage(request.data)
            serializer.save(waveform=imgData['image'])
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
