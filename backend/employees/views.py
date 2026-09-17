from rest_framework import viewsets

from .models import Conge, Employee
from .serializers import CongeSerializer, EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.prefetch_related("conges").all()
    serializer_class = EmployeeSerializer


class CongeViewSet(viewsets.ModelViewSet):
    queryset = Conge.objects.select_related("employee").all()
    serializer_class = CongeSerializer
