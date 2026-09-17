from rest_framework import viewsets

from .models import HistoryEntry, Prestation, Projet, Tache
from .serializers import HistoryEntrySerializer, PrestationSerializer, ProjetSerializer, TacheSerializer


class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.select_related("client").prefetch_related("prestations").all()
    serializer_class = ProjetSerializer


class PrestationViewSet(viewsets.ModelViewSet):
    queryset = Prestation.objects.select_related("projet", "agent_bureau", "agent_controle", "vehicule").prefetch_related(
        "agent_chantier", "materiels", "taches", "history",
    ).all()
    serializer_class = PrestationSerializer


class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.select_related("prestation").all()
    serializer_class = TacheSerializer


class HistoryEntryViewSet(viewsets.ModelViewSet):
    queryset = HistoryEntry.objects.select_related("prestation").all()
    serializer_class = HistoryEntrySerializer
