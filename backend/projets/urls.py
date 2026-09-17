from rest_framework.routers import DefaultRouter

from .views import HistoryEntryViewSet, PrestationViewSet, ProjetViewSet, TacheViewSet

router = DefaultRouter()
router.register("projets", ProjetViewSet)
router.register("prestations", PrestationViewSet)
router.register("taches", TacheViewSet)
router.register("history", HistoryEntryViewSet)

urlpatterns = router.urls
