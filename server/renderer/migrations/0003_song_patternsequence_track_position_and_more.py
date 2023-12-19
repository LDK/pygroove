# Generated by Django 5.0 on 2023-12-19 00:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0002_remove_stepsequence_channel_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='patternSequence',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='track',
            name='position',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='filter',
            name='filter_type',
            field=models.CharField(default='lp', max_length=8),
        ),
        migrations.AlterField(
            model_name='filter',
            name='frequency',
            field=models.FloatField(default=2500),
        ),
        migrations.AlterField(
            model_name='filter',
            name='on',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='filter',
            name='position',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='filter',
            name='q',
            field=models.FloatField(default=0.5),
        ),
        migrations.AlterField(
            model_name='pattern',
            name='bars',
            field=models.IntegerField(default=2),
        ),
        migrations.AlterField(
            model_name='pattern',
            name='position',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='sample',
            name='normalize',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='sample',
            name='reverse',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='sample',
            name='trim',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='song',
            name='bpm',
            field=models.IntegerField(default=120),
        ),
        migrations.AlterField(
            model_name='song',
            name='swing',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='step',
            name='loc',
            field=models.CharField(default='1.1.1', max_length=12),
        ),
        migrations.AlterField(
            model_name='step',
            name='pitch',
            field=models.CharField(default='C4', max_length=5),
        ),
        migrations.AlterField(
            model_name='step',
            name='reverse',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='step',
            name='velocity',
            field=models.IntegerField(default=100),
        ),
        migrations.AlterField(
            model_name='track',
            name='disabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='track',
            name='pan',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='track',
            name='transpose',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='track',
            name='volume',
            field=models.FloatField(default=-6),
        ),
    ]