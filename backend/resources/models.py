from django.db import models

TYPE_CHOICES = [
    ("station_totale", "Station totale"),
    ("gps", "GPS / GNSS"),
    ("drone", "Drone"),
    ("scanner", "Scanner 3D / LiDAR"),
    ("niveau", "Niveau optique"),
    ("vehicule", "Véhicule"),
    ("autre", "Autre"),
]

STATUS_CHOICES = [
    ("operationnel", "Opérationnel"),
    ("maintenance", "En maintenance"),
    ("hors_service", "Hors service"),
]


class Resource(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    nom = models.CharField(max_length=200)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    marque = models.CharField(max_length=100, blank=True)
    modele = models.CharField(max_length=100, blank=True)
    numero_serie = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="operationnel")
    derniere_calibration = models.DateField(null=True, blank=True)
    prochaine_calibration = models.DateField(null=True, blank=True)
    emplacement = models.CharField(max_length=200, blank=True)
    date_achat = models.DateField(null=True, blank=True)
    valeur = models.CharField(max_length=50, blank=True)
    fournisseur = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class MaintenanceLogEntry(models.Model):
    resource = models.ForeignKey(Resource, related_name="maintenance_log", on_delete=models.CASCADE)
    date = models.DateField()
    label = models.CharField(max_length=300)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.resource} — {self.label}"
