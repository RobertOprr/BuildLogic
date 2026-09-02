from unittest import TestCase
from unittest.mock import MagicMock
from components.services.validation_service import (
    validate_compatibility,
    calculate_total_power,
    validate_power_supply
)


class TestValidationService(TestCase):
    def setUp(self):
        # Cream componente false (mocks) perfect compatibile pentru testul de baza
        self.cpu = MagicMock()
        self.cpu.socket = "AM5"
        self.cpu.tdp_watts = 105

        self.mobo = MagicMock()
        self.mobo.socket = "AM5"
        self.mobo.ram_type = "DDR5"
        self.mobo.form_factor = "ATX"

        self.ram = MagicMock()
        self.ram.ram_type = "DDR5"
        self.ram.tdp_watts = 15

        self.case = MagicMock()
        self.case.supported_form_factor = "ATX"
        self.case.max_gpu_length_mm = 350

        self.gpu = MagicMock()
        self.gpu.length_mm = 300
        self.gpu.tdp_watts = 250

        self.psu = MagicMock()
        self.psu.wattage = 850

    def test_validate_compatibility_success(self):
        """Testam un sistem in care toate piesele se potrivesc."""
        result = validate_compatibility(
            self.cpu, self.mobo, self.ram, self.case, self.gpu)
        self.assertTrue(result["is_valid"])
        self.assertEqual(len(result["errors"]), 0)

    def test_validate_compatibility_socket_mismatch(self):
        """Testam ce se intampla daca procesorul nu intra in placa de baza."""
        self.cpu.socket = "LGA1700"  # Fortam o eroare
        result = validate_compatibility(
            self.cpu, self.mobo, self.ram, self.case, self.gpu)
        self.assertFalse(result["is_valid"])
        self.assertIn("Incompatibilitate Socket", result["errors"][0])

    def test_validate_compatibility_gpu_too_big(self):
        """Testam daca placa video loveste carcasa."""
        self.gpu.length_mm = 400  # Placa are 400mm, carcasa suporta doar 350mm
        result = validate_compatibility(
            self.cpu, self.mobo, self.ram, self.case, self.gpu)
        self.assertFalse(result["is_valid"])
        self.assertIn("Incompatibilitate Spatiu", result["errors"][0])

    def test_calculate_total_power(self):
        """Testam matematica consumului de curent."""
        # 105 (CPU) + 250 (GPU) + 15 (RAM) + 50 (Baza) = 420W
        total = calculate_total_power(self.cpu, self.gpu, self.ram)
        self.assertEqual(total, 420)

    def test_validate_power_supply_valid(self):
        """Testam o sursa suficient de puternica."""
        # Consum 420W -> Recomandat 520W. Avem 850W, deci e OK.
        result = validate_power_supply(420, self.psu)
        self.assertTrue(result["is_valid"])
        self.assertIsNone(result["error"])

    def test_validate_power_supply_invalid(self):
        """Testam ce se intampla cand sursa e prea slaba pentru sistem."""
        self.psu.wattage = 400  # Sursa slaba
        result = validate_power_supply(420, self.psu)
        self.assertFalse(result["is_valid"])
        self.assertIsNotNone(result["error"])
