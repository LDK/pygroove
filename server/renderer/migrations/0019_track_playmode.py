# Generated by Django 5.0 on 2024-01-22 07:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0018_more_samples'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='playMode',
            field=models.CharField(default='oneshot', max_length=8),
        ),
    ]
