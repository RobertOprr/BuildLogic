from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cpus', views.CPUViewSet)
router.register(r'motherboards', views.MotherboardViewSet)
router.register(r'rams', views.RAMViewSet)
router.register(r'gpus', views.GPUViewSet)
router.register(r'psus', views.PSUViewSet)
router.register(r'cases', views.CaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('validate/', views.validate_pc, name='validate_pc'),
    path('bottleneck/', views.check_bottleneck,
         name='check_bottleneck'),
]
