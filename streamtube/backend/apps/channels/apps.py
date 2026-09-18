from django.apps import AppConfig


class ChannelsConfig(AppConfig):
    name = 'apps.channels'

    def ready(self):
        from . import signals  # noqa
