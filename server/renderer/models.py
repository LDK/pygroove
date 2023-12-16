from django.db import models
from django.contrib.auth.models import User

# Defines a Song model with a title, user, bpm, and swing
# User field defines a many-to-one relationship with User model

class Song(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bpm = models.IntegerField()
    swing = models.FloatField()


# Defines a Pattern model with a song, name, bars, and position
# Song field defines a many-to-one relationship with Song model
    
class Pattern(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    bars = models.IntegerField()
    position = models.IntegerField()

# Defines a Channel model with a song, name, pan, and volume
# Song field defines a many-to-one relationship with Song model

class Channel(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    pan = models.FloatField()
    volume = models.FloatField()

class StepSequence(models.Model):
    pattern = models.ForeignKey(Pattern, on_delete=models.CASCADE)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    steps = models.JSONField()

class Sample(models.Model):
    filename = models.CharField(max_length=100)
    normalize = models.BooleanField()
    reverse = models.BooleanField()
    trim = models.BooleanField()

class FilterSection(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    filter_type = models.CharField(max_length=50)
    frequency = models.FloatField()
    is_on = models.BooleanField()
