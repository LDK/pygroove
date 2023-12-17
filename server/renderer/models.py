# models.py
from django.db import models
from django.contrib.auth.models import User

class Song(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bpm = models.IntegerField()
    swing = models.FloatField()
    patternSequence = models.JSONField(default=list)

class Sample(models.Model):
    filename = models.CharField(max_length=100)
    normalize = models.BooleanField()
    reverse = models.BooleanField()
    trim = models.BooleanField()

class Track(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='tracks')
    name = models.CharField(max_length=100)
    pan = models.FloatField()
    volume = models.FloatField()
    sample = models.ForeignKey(Sample, on_delete=models.SET_NULL, null=True)
    disabled = models.BooleanField()
    transpose = models.IntegerField()

class Pattern(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    bars = models.IntegerField()
    position = models.IntegerField()

class Filter(models.Model):
    position = models.IntegerField()
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='filters')
    on = models.BooleanField()
    filter_type = models.CharField(max_length=50)
    frequency = models.FloatField()
    q = models.FloatField()

class Step(models.Model):
    pattern = models.ForeignKey(Pattern, related_name='steps', on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    loc = models.CharField(max_length=100)
    filter = models.JSONField(default=dict)
    pitch = models.CharField(max_length=3)
    reverse = models.BooleanField()
    velocity = models.IntegerField()
    # pan defaults to 0
    pan = models.FloatField(default=0)