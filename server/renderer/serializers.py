from rest_framework import serializers
from .models import Song, Pattern, Channel, StepSequence, Sample, FilterSection
from django.contrib.auth.models import User

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'user', 'bpm', 'swing']

class PatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pattern
        fields = ['id', 'song', 'name', 'bars', 'position']

class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['id', 'song', 'name', 'pan', 'volume']

class StepSequenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepSequence
        fields = ['id', 'pattern', 'channel', 'steps']

class SampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = ['id', 'filename', 'normalize', 'reverse', 'trim']

class FilterSectionSerializer(serializers.ModelSerializer):
  class Meta:
    model = FilterSection
    fields = ['id', 'channel', 'filter_type', 'frequency', 'is_on']

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('username', 'email', 'password')
    extra_kwargs = {'password': {'write_only': True}}

  def create(self, validated_data):
    return User.objects.create_user(**validated_data)
