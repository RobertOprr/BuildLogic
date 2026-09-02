from django.contrib import admin
from .models import Socket, RamType, FormFactor, CPU, Motherboard, RAM, GPU, PSU, Case


@admin.register(CPU)
class CPUAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'socket',
                    'tdp_watts', 'single_core_score')
    search_fields = ('name', 'brand')
    list_filter = ('brand', 'socket')


@admin.register(Motherboard)
class MotherboardAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'socket', 'ram_type', 'form_factor')
    search_fields = ('name', 'brand')
    list_filter = ('socket', 'ram_type', 'form_factor')


admin.site.register(Socket)
admin.site.register(RamType)
admin.site.register(FormFactor)
admin.site.register(RAM)
admin.site.register(GPU)
admin.site.register(PSU)
admin.site.register(Case)
