from components.models import CPU, Motherboard, RAM, Case, GPU, PSU


def validate_compatibility(cpu: CPU, motherboard: Motherboard, ram: RAM, pc_case: Case = None, gpu: GPU = None):
    errors = []
    if cpu.socket != motherboard.socket:
        errors.append(
            f"Incompatibilitate Socket: Procesorul foloseste {cpu.socket}, iar placa de baza suporta {motherboard.socket}.")

    if ram.ram_type != motherboard.ram_type:
        errors.append(
            f"Incompatibilitate RAM: Memoria este {ram.ram_type}, iar placa de baza suporta {motherboard.ram_type}.")

    if pc_case and motherboard.form_factor != pc_case.supported_form_factor:
        errors.append(
            f"Incompatibilitate Carcasa: Placa de baza ({motherboard.form_factor}) nu se potriveste in carcasa.")

    if pc_case and gpu and gpu.length_mm > pc_case.max_gpu_length_mm:
        errors.append(
            f"Incompatibilitate Spatiu: Placa video are {gpu.length_mm}mm, carcasa suporta maxim {pc_case.max_gpu_length_mm}mm.")

    return {"is_valid": len(errors) == 0, "errors": errors}


def calculate_total_power(cpu: CPU, gpu: GPU = None, ram: RAM = None) -> int:
    total = cpu.tdp_watts
    if gpu:
        total += gpu.tdp_watts
    if ram:
        total += ram.tdp_watts
    total += 50  # Consum de baza (ventilatoare, placa de baza, stocare)
    return total


def validate_power_supply(total_power: int, psu: PSU):
    recommended_psu = total_power + 100  # O marja de siguranta de 100W
    is_valid = psu.wattage >= recommended_psu
    return {
        "is_valid": is_valid,
        "required_wattage": recommended_psu,
        "psu_wattage": psu.wattage,
        "error": f"Sursa prea slaba. Sistemul are nevoie de minim {recommended_psu}W." if not is_valid else None
    }
