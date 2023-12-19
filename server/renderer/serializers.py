# serializers.py
from rest_framework import serializers
from .models import Song, Pattern, Step, Sample, Filter, Track
from django.contrib.auth.models import User

class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ['pitch', 'filter', 'loc', 'reverse', 'velocity', 'track']

class FilterSerializer(serializers.ModelSerializer):
  class Meta:
    model = Filter
    fields = ['id', 'channel', 'filter_type', 'frequency', 'is_on', 'q', 'position']

class TrackSerializer(serializers.ModelSerializer):
    filters = FilterSerializer(many=True)

    class Meta:
        model = Track
        fields = ['id', 'name', 'pan', 'volume', 'sample', 'filters', 'disabled', 'transpose', 'position']

class PatternSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)

    class Meta:
        model = Pattern
        fields = ['id', 'name', 'bars', 'position', 'steps']

class SampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = ['id', 'filename', 'display']

class SongSerializer(serializers.ModelSerializer):
    patterns = PatternSerializer(many=True)
    tracks = TrackSerializer(many=True)

    class Meta:
        model = Song
        fields = ['id', 'bpm', 'title', 'swing', 'author', 'tracks', 'patterns']

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('username', 'email', 'password')
    extra_kwargs = {'password': {'write_only': True}}

  def create(self, validated_data):
    return User.objects.create_user(**validated_data)
