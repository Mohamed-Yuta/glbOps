from rest_framework import viewsets

from .models import MaintenanceLogEntry, Resource
from .serializers import MaintenanceLogEntrySerializer, ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.prefetch_related("maintenance_log").all()
    serializer_class = ResourceSerializer


class MaintenanceLogEntryViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLogEntry.objects.select_related("resource").all()
    serializer_class = MaintenanceLogEntrySerializer
