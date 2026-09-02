from rest_framework import serializers
from .models import CPU, Motherboard, RAM, GPU, PSU, Case


class CPUSerializer(serializers.ModelSerializer):
    socket_name = serializers.CharField(source='socket.name', read_only=True)

    class Meta:
        model = CPU
        fields = '__all__'


class MotherboardSerializer(serializers.ModelSerializer):
    socket_name = serializers.CharField(source='socket.name', read_only=True)
    ram_type_name = serializers.CharField(
        source='ram_type.name', read_only=True)
    form_factor_name = serializers.CharField(
        source='form_factor.name', read_only=True)

    class Meta:
        model = Motherboard
        fields = '__all__'


class RAMSerializer(serializers.ModelSerializer):
    ram_type_name = serializers.CharField(
        source='ram_type.name', read_only=True)

    class Meta:
        model = RAM
        fields = '__all__'


class GPUSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPU
        fields = '__all__'


class PSUSerializer(serializers.ModelSerializer):
    class Meta:
        model = PSU
        fields = '__all__'


class CaseSerializer(serializers.ModelSerializer):
    supported_form_factor_name = serializers.CharField(
        source='supported_form_factor.name', read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
