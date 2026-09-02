from dataclasses import dataclass
from components.models import CPU, GPU


@dataclass
class BottleneckResult:
    bottleneck_component: str
    bottleneck_percentage: float
    resolution: str
    cpu_score: int
    gpu_score: int
    cpu_required: float
    interpretation: str


# Variabilele pe care testul nu le gasea:
CPU_DEMAND_MULTIPLIERS = {
    "1080p": 1.2,
    "1440p": 1.0,
    "4K": 0.6
}
BALANCE_THRESHOLD_PERCENT = 10.0


def calculate_bottleneck(cpu: CPU, gpu: GPU, resolution: str) -> BottleneckResult:
    if resolution not in CPU_DEMAND_MULTIPLIERS:
        raise ValueError(f"Rezolutie necunoscuta: {resolution}")
    if cpu.single_core_score <= 0:
        raise ValueError(f"CPU-ul {cpu.name} are un scor invalid (0).")
    if not (1 <= gpu.render_score <= 100):
        raise ValueError(
            f"GPU-ul {gpu.name} are un scor in afara scalei [1, 100].")

    multiplier = CPU_DEMAND_MULTIPLIERS[resolution]
    cpu_required = gpu.render_score * multiplier
    cpu_offered = cpu.single_core_score

    if cpu_offered < cpu_required:
        bottleneck_component = "CPU"
        bottleneck_percentage = (
            (cpu_required - cpu_offered) / cpu_required) * 100
        interpretation = f"Procesorul {cpu.name} este prea slab pentru placa video la {resolution}."
    else:
        bottleneck_component = "GPU"
        bottleneck_percentage = (
            (cpu_offered - cpu_required) / cpu_offered) * 100
        interpretation = f"Sistem limitat de placa video (normal in gaming) la {resolution}."

    if bottleneck_percentage < BALANCE_THRESHOLD_PERCENT:
        bottleneck_component = "Echilibrat"
        interpretation = f"Sistem echilibrat la {resolution}."

    return BottleneckResult(
        bottleneck_component=bottleneck_component,
        bottleneck_percentage=round(bottleneck_percentage, 1),
        resolution=resolution,
        cpu_score=cpu_offered,
        gpu_score=gpu.render_score,
        cpu_required=round(cpu_required, 1),
        interpretation=interpretation
    )
