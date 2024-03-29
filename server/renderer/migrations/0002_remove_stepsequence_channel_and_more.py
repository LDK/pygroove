# Generated by Django 5.0 on 2023-12-16 07:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stepsequence',
            name='channel',
        ),
        migrations.RemoveField(
            model_name='filtersection',
            name='channel',
        ),
        migrations.RemoveField(
            model_name='stepsequence',
            name='pattern',
        ),
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('pan', models.FloatField()),
                ('volume', models.FloatField()),
                ('disabled', models.BooleanField()),
                ('transpose', models.IntegerField()),
                ('sample', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='renderer.sample')),
                ('song', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tracks', to='renderer.song')),
            ],
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('loc', models.CharField(max_length=100)),
                ('filter', models.JSONField(default=dict)),
                ('pitch', models.CharField(max_length=3)),
                ('reverse', models.BooleanField()),
                ('velocity', models.IntegerField()),
                ('pan', models.FloatField(default=0)),
                ('pattern', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='steps', to='renderer.pattern')),
                ('track', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='renderer.track')),
            ],
        ),
        migrations.CreateModel(
            name='Filter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.IntegerField()),
                ('on', models.BooleanField()),
                ('filter_type', models.CharField(max_length=50)),
                ('frequency', models.FloatField()),
                ('q', models.FloatField()),
                ('track', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='filters', to='renderer.track')),
            ],
        ),
        migrations.DeleteModel(
            name='Channel',
        ),
        migrations.DeleteModel(
            name='FilterSection',
        ),
        migrations.DeleteModel(
            name='StepSequence',
        ),
    ]
