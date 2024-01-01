import io
from renderer.groove import renderJSON
from ..models import Filter, Song, Pattern, Sample, Step, Track
from ..serializers import SongSerializer, PatternSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.http import FileResponse
from rest_framework.views import APIView

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, pk=None):
        # Check authentication
        # if not request.user.is_authenticated:
        #     return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get song from database         
        try:
            song = Song.objects.get(pk=pk)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check to see if the current user is the author of the song
        # if song.user != request.user:
        #     return Response({'error': 'Not authorized'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = SongSerializer(song)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # updating an existing song
    def put(self, request, pk=None):
        # Check authentication
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get song from database         
        try:
            song = Song.objects.get(pk=pk)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check to see if the current user is the author of the song
        if song.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
        # Save song to database
        song.title = request.data['title']
        song.author = request.data['author']
        song.bpm = request.data['bpm']
        song.swing = request.data['swing']
        song.patternSequence = request.data['patternSequence']
        song.save()

        # Decode post/put json data for Tracks and Patterns and store as variables
        tracks = request.data['tracks']
        patterns = request.data['patterns']

        # Create dict trackIndex of Tracks keyed by `position`
        trackIndex = {}
        for track in tracks:
            trackIndex[track['position']] = track

        # Create dict patternIndex of Patterns keyed by `position`
        patternIndex = {}
        for pattern in patterns:
            patternIndex[pattern['position']] = pattern

        # For each Track:
        for track in tracks:
            # Check to see if there is an existing Track in the database keyed to the current song, in the same position
            # If there is, update the existing Track with the new data
            # If there is not, create a new Track with the new data
            if Track.objects.filter(song=song, position=track['position']).exists():
                # Update that row with Track data, and use the updated DB row to update trackIndex
                trackToUpdate = Track.objects.get(song=song, position=track['position'])
                trackToUpdate.name = track['name']
                trackToUpdate.pan = track['pan'] if 'pan' in track else 0
                trackToUpdate.volume = track['volume'] if 'volume' in track else -6
                trackToUpdate.sample = Sample.objects.get(filename=track['sample'])
                trackToUpdate.disabled = track['disabled'] if 'disabled' in track else False
                trackToUpdate.transpose = track['transpose'] if 'transpose' in track else 0
                trackToUpdate.rootPitch = track['rootPitch'] if 'rootPitch' in track else 'C3'
                trackToUpdate.pitchShift = track['pitchShift'] if 'pitchShift' in track else 0
                trackToUpdate.reverse = track['reverse'] if 'reverse' in track else False
                trackToUpdate.startOffset = track['startOffset'] if 'startOffset' in track else 0
                trackToUpdate.endOffset = track['endOffset'] if 'endOffset' in track else 0
                trackToUpdate.fadeIn = track['fadeIn'] if 'fadeIn' in track else 0
                trackToUpdate.fadeOut = track['fadeOut'] if 'fadeOut' in track else 0
                trackToUpdate.normalize = track['normalize'] if 'normalize' in track else False
                trackToUpdate.trim = track['trim'] if 'trim' in track else False
                trackToUpdate.save()
                trackIndex[track['position']] = trackToUpdate
            else:
                # Create new Track row in the DB, pointing to current Song, and use the resulting saved DB row to update trackIndex
                newTrack = Track.objects.create(
                    song=song,
                    name=track['name'],
                    pan=track['pan'],
                    volume=track['volume'],
                    sample=Sample.objects.get(filename=track['sample']),
                    disabled=track['disabled'],
                    transpose=track['transpose'],
                    position=track['position']
                )
                newTrack.save()
                trackIndex[track['position']] = newTrack

            # For each Filter in the current Track:
            for filter in track['filters'] if 'filters' in track else []:
                # Check to see if there is an existing Filter in the database keyed to the current Track, in the same position
                # If there is, update the existing Filter with the new data
                # If there is not, create a new Filter with the new data
                if Filter.objects.filter(track=trackIndex[track['position']], position=filter['position']).exists():
                    # Update that row with Filter data
                    filterToUpdate = Filter.objects.get(track=trackIndex[track['position']], position=filter['position'])
                    filterToUpdate.on = filter['on']
                    filterToUpdate.filter_type = filter['filter_type']
                    filterToUpdate.frequency = filter['frequency']
                    filterToUpdate.q = filter['q']
                    filterToUpdate.save()
                else:
                    # Create new Filter row in the DB, pointing to current Track
                    newFilter = Filter.objects.create(
                        track=trackIndex[track['position']],
                        on=filter['on'],
                        filter_type=filter['filter_type'],
                        frequency=filter['frequency'],
                        q=filter['q'],
                        position=filter['position']
                    )
                    newFilter.save()
        
        # Delete any Tracks in the DB keyed to the current song whose `position` field is a value not found in any row of trackIndex
        Track.objects.filter(song=song).exclude(position__in=trackIndex.keys()).delete()

        # For each Pattern:
        for pattern in patterns:
            # Check to see if there is an existing Pattern in the database keyed to the current song, in the same position
            # If there is, update the existing Pattern with the new data
            # If there is not, create a new Pattern with the new data
            if Pattern.objects.filter(song=song, position=pattern['position']).exists():
                # Update that row with Pattern data, and use the updated DB row to update patternIndex
                patternToUpdate = Pattern.objects.get(song=song, position=pattern['position'])
                patternToUpdate.name = pattern['name']
                patternToUpdate.bars = pattern['bars']
                patternToUpdate.save()
                patternIndex[pattern['position']] = patternToUpdate
            else:
                # Create new Pattern row in the DB, pointing to current Song, and use the resulting saved DB row to update patternIndex
                newPattern = Pattern.objects.create(
                    song=song,
                    name=pattern['name'],
                    bars=pattern['bars'],
                    position=pattern['position']
                )
                newPattern.save()
                patternIndex[pattern['position']] = newPattern

            # For each Step in the current Pattern:
            for step in pattern['steps']:
                # Check to see if there is an existing Step in the database keyed to the current Pattern, at the same `loc` and `track_` values
                # If there is, update the existing Step with the new data
                # If there is not, create a new Step with the new data
                if Step.objects.filter(pattern=patternIndex[pattern['position']], loc=step['loc']).exists():
                    # Update that row with Step data
                    stepToUpdate = Step.objects.get(pattern=patternIndex[pattern['position']], loc=step['loc'])
                    stepToUpdate.track = trackIndex[step['track']['position']]
                    stepToUpdate.filter = step['filter'] if 'filter' in step else {}
                    stepToUpdate.pitch = step['pitch'] if 'pitch' in step else 'C3'
                    stepToUpdate.reverse = step['reverse'] if 'reverse' in step else False
                    stepToUpdate.velocity = step['velocity'] if 'velocity' in step else 100
                    stepToUpdate.pan = step['pan'] if 'pan' in step else 0
                    stepToUpdate.on = step['on'] if 'on' in step else False
                    stepToUpdate.save()
                else:
                    # Create new Step row in the DB, pointing to current Pattern
                    newStep = Step.objects.create(
                        pattern=patternToUpdate,
                        track=trackIndex[step['track']['position']],
                        # need to convert loc.bar, loc.beat, loc.tick to a string as they will be numbers in the JSON
                        loc='.'.join([str(step['loc']['bar']), str(step['loc']['beat']), str(step['loc']['tick'])]),
                        filter=step['filter'] if 'filter' in step else {},
                        pitch=step['pitch'] if 'pitch' in step else 'C3',
                        reverse=step['reverse'] if 'reverse' in step else False,
                        velocity=step['velocity'] if 'velocity' in step else 100,
                        pan=step['pan'] if 'pan' in step else 0,
                        on=step['on'] if 'on' in step else False
                    )
                    newStep.save()

        # Delete any Patterns in the DB keyed to the current song whose `position` field is a value not found in any row of patternIndex
        Pattern.objects.filter(song=song).exclude(position__in=patternIndex.keys()).delete()

        # return response
        return Response({'id': song.id}, status=status.HTTP_200_OK)

class PatternViewSet(viewsets.ModelViewSet):
    queryset = Pattern.objects.all()
    serializer_class = PatternSerializer

class RenderView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        print(request.data)

        # Call renderJSON and get MP3 data as bytes
        mp3_data = renderJSON(request.data)

        # Create a FileResponse with MP3 data
        response = FileResponse(io.BytesIO(mp3_data), as_attachment=True, filename='rendered_audio.mp3')
        response['Content-Type'] = 'audio/mpeg'

        return response

class CreateSongView(APIView):
    def post(self, request):
        # Check authentication
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        print(request.data)
        # Save song to database
        song = Song.objects.create(
            title=request.data['title'],
            author=request.data['author'],
            user=request.user,
            bpm=request.data['bpm'],
            swing=request.data['swing'],
            patternSequence=request.data['patternSequence']
        )

        # For each Track:
        for track in request.data['tracks']:
            # Create new Track row in the DB, pointing to current Song
            newTrack = Track.objects.create(
                song=song,
                name=track['name'],
                pan=track['pan'] if 'pan' in track else 0,
                volume=track['volume'] if 'volume' in track else -6,
                sample=Sample.objects.get(filename=track['sample']) if 'sample' in track else None,
                disabled=track['disabled'] if 'disabled' in track else False,
                transpose=track['transpose'] if 'transpose' in track else 0,
                position=track['position'] if 'position' in track else 0,
                rootPitch=track['rootPitch'] if 'rootPitch' in track else 'C3',
                pitchShift=track['pitchShift'] if 'pitchShift' in track else 0,
                reverse=track['reverse'] if 'reverse' in track else False,
                startOffset = track['startOffset'] if 'startOffset' in track else 0,
                endOffset = track['endOffset'] if 'endOffset' in track else 0,
                fadeIn = track['fadeIn'] if 'fadeIn' in track else 0,
                fadeOut = track['fadeOut'] if 'fadeOut' in track else 0,
                normalize = track['normalize'] if 'normalize' in track else False,
                trim = track['trim'] if 'trim' in track else False
                
            )
            newTrack.save()

            # For each Filter in the current Track:
            for filter in track['filters'] if 'filters' in track else []:
                # Create new Filter row in the DB, pointing to current Track
                newFilter = Filter.objects.create(
                    track=newTrack,
                    on=filter['on'],
                    filter_type=filter['filter_type'],
                    frequency=filter['frequency'],
                    q=filter['q'],
                    position=filter['position']
                )
                newFilter.save()

        # return response
        return Response({'id': song.id}, status=status.HTTP_201_CREATED)
