from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("fakultetet", FakultetiViewSet)
router.register("users", UserViewSet)
router.register("administratoret", AdministratorViewSet)
router.register("profesoret", ProfesoriViewSet)
router.register("studentet", StudentiViewSet)
router.register("lendet", LendaViewSet)

urlpatterns = router.urls
