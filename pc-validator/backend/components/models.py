from django.db import models
from django.core.validators import MinValueValidator

class Socket(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name


class RamType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name


class FormFactor(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name


# --- COMPONENTE HARDWARE ---
class CPU(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    socket = models.ForeignKey(
        Socket, on_delete=models.PROTECT, related_name="cpus")
    tdp_watts = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    has_integrated_gpu = models.BooleanField(default=False)
    single_core_score = models.PositiveIntegerField(default=0)

    def __str__(self): return f"{self.brand} {self.name}"


class Motherboard(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    socket = models.ForeignKey(Socket, on_delete=models.PROTECT)
    ram_type = models.ForeignKey(RamType, on_delete=models.PROTECT)
    form_factor = models.ForeignKey(FormFactor, on_delete=models.PROTECT)
    ram_slots = models.PositiveIntegerField()
    max_ram_gb = models.PositiveIntegerField()

    def __str__(self): return f"{self.brand} {self.name}"


class RAM(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    ram_type = models.ForeignKey(RamType, on_delete=models.PROTECT)
    capacity_gb = models.PositiveIntegerField()
    speed_mhz = models.PositiveIntegerField()
    tdp_watts = models.PositiveIntegerField()

    def __str__(self): return f"{self.brand} {self.capacity_gb}GB {self.name}"


class GPU(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    length_mm = models.PositiveIntegerField()
    tdp_watts = models.PositiveIntegerField()
    render_score = models.PositiveIntegerField(default=0)

    def __str__(self): return f"{self.brand} {self.name}"


class PSU(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    wattage = models.PositiveIntegerField()

    def __str__(self): return f"{self.brand} {self.name} {self.wattage}W"


class Case(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=50)
    supported_form_factor = models.ForeignKey(
        FormFactor, on_delete=models.PROTECT)
    max_gpu_length_mm = models.PositiveIntegerField()

    def __str__(self): return f"{self.brand} {self.name}"
