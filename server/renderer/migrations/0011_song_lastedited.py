# Generated by Django 5.0 on 2024-01-15 03:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renderer', '0010_remove_step_filter_filter_step_alter_filter_track'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='lastEdited',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
