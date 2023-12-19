# models.py
from django.db import models
from django.contrib.auth.models import User

class Song(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bpm = models.IntegerField(default=120)
    swing = models.FloatField(default=0)
    patternSequence = models.JSONField(default=list)

class Sample(models.Model):
    filename = models.CharField(max_length=100)
    normalize = models.BooleanField(default=False)
    reverse = models.BooleanField(default=False)
    trim = models.BooleanField(default=False)

class Track(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='tracks')
    name = models.CharField(max_length=100)
    pan = models.FloatField(default=0)
    volume = models.FloatField(default=-6)
    sample = models.ForeignKey(Sample, on_delete=models.SET_NULL, null=True)
    disabled = models.BooleanField(default=False)
    transpose = models.IntegerField(default=0)
    position = models.IntegerField(default=1)

class Pattern(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    bars = models.IntegerField(default=2)
    position = models.IntegerField(default=1)

class Filter(models.Model):
    position = models.IntegerField(default=1)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='filters')
    on = models.BooleanField(default=False)
    filter_type = models.CharField(max_length=8, default='lp')
    frequency = models.FloatField(default=2500)
    q = models.FloatField(default=.5)

class Step(models.Model):
    pattern = models.ForeignKey(Pattern, related_name='steps', on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    loc = models.CharField(max_length=12, default='1.1.1')
    filter = models.JSONField(default=dict)
    pitch = models.CharField(max_length=5, default='C4')
    reverse = models.BooleanField(default=False)
    velocity = models.IntegerField(default=100)
    pan = models.FloatField(default=0)