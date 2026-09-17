from rest_framework import serializers

from .models import MaintenanceLogEntry, Resource


class MaintenanceLogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLogEntry
        fields = ["id", "resource", "date", "label"]


class ResourceSerializer(serializers.ModelSerializer):
    maintenance_log = MaintenanceLogEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id", "nom", "type", "marque", "modele", "numero_serie", "status",
            "derniere_calibration", "prochaine_calibration", "emplacement",
            "date_achat", "valeur", "fournisseur", "maintenance_log",
        ]
