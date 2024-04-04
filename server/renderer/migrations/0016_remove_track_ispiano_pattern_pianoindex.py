# Generated by Django 5.0 on 2024-01-19 03:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0015_track_ispiano'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='track',
            name='isPiano',
        ),
        migrations.AddField(
            model_name='pattern',
            name='pianoIndex',
            field=models.JSONField(default=list),
        ),
    ]
