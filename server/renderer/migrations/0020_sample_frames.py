# Generated by Django 5.0 on 2024-01-22 20:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0019_track_playmode'),
    ]

    operations = [
        migrations.AddField(
            model_name='sample',
            name='frames',
            field=models.BigIntegerField(default=0),
        ),
    ]