#_views.py
from django.shortcuts import render

from .views.user import *
from .views.sample import *
from .views.song import *

def index(request):
  return render(request, 'renderer/index.html')
