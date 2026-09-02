import logging

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CPU, Motherboard, RAM, GPU, PSU, Case
from .serializers import (CPUSerializer, MotherboardSerializer, RAMSerializer,
                          GPUSerializer, PSUSerializer, CaseSerializer)
from .services.validation_service import validate_compatibility, calculate_total_power, validate_power_supply
from .services.bottleneck_service import calculate_bottleneck

logger = logging.getLogger(__name__)


class CPUViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CPU.objects.all()
    serializer_class = CPUSerializer


class MotherboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Motherboard.objects.all()
    serializer_class = MotherboardSerializer


class RAMViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RAM.objects.all()
    serializer_class = RAMSerializer


class GPUViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GPU.objects.all()
    serializer_class = GPUSerializer


class PSUViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PSU.objects.all()
    serializer_class = PSUSerializer


class CaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer


@api_view(['POST'])
def validate_pc(request):
    data = request.data
    try:
        cpu = CPU.objects.get(id=data.get('cpu_id'))
        mobo = Motherboard.objects.get(id=data.get('motherboard_id'))
        ram = RAM.objects.get(id=data.get('ram_id'))
        pc_case = Case.objects.get(id=data.get(
            'case_id')) if data.get('case_id') else None
        gpu = GPU.objects.get(id=data.get(
            'gpu_id')) if data.get('gpu_id') else None
        psu = PSU.objects.get(id=data.get(
            'psu_id')) if data.get('psu_id') else None
        resolution = data.get('resolution', '1080p')

        # 1. Validare fizica
        compat_result = validate_compatibility(cpu, mobo, ram, pc_case, gpu)

        # 2. Validare consum
        power_result = None
        if psu:
            total_power = calculate_total_power(cpu, gpu, ram)
            power_result = validate_power_supply(total_power, psu)

        # 3. Calcul Bottleneck
        bottleneck_result = None
        if gpu:
            try:
                bottleneck = calculate_bottleneck(cpu, gpu, resolution)
                bottleneck_result = {
                    "component": bottleneck.bottleneck_component,
                    "percentage": bottleneck.bottleneck_percentage,
                    "interpretation": bottleneck.interpretation
                }
            except Exception:
                logger.exception("Bottleneck calculation failed in validate_pc")
                bottleneck_result = {"error": "Nu s-a putut calcula bottleneck-ul."}

        return Response({
            "compatibility": compat_result,
            "power": power_result,
            "bottleneck": bottleneck_result
        })
    except Exception:
        logger.exception("validate_pc failed")
        return Response({"error": "Date incomplete sau invalide."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def check_bottleneck(request):
    cpu_id = request.query_params.get('cpu_id')
    gpu_id = request.query_params.get('gpu_id')
    resolution = request.query_params.get('resolution', '1080p')

    if not cpu_id or not gpu_id:
        return Response({"error": "Sunt necesare ambele ID-uri (cpu_id si gpu_id)."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cpu = CPU.objects.get(id=cpu_id)
        gpu = GPU.objects.get(id=gpu_id)

        # Apelam serviciul pe care l-am testat inainte
        bottleneck = calculate_bottleneck(cpu, gpu, resolution)

        return Response({
            "bottleneck_component": bottleneck.bottleneck_component,
            "bottleneck_percentage": bottleneck.bottleneck_percentage,
            "interpretation": bottleneck.interpretation,
            "cpu_score": bottleneck.cpu_score,
            "gpu_score": bottleneck.gpu_score,
            "cpu_required": bottleneck.cpu_required
        })
    except (CPU.DoesNotExist, GPU.DoesNotExist):
        return Response({"error": "Componenta nu a fost gasita in baza de date."}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception("check_bottleneck failed")
        return Response({"error": "Date invalide."}, status=status.HTTP_400_BAD_REQUEST)
