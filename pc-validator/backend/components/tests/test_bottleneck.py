from unittest import TestCase
from unittest.mock import MagicMock

from components.services.bottleneck_service import (
    calculate_bottleneck,
    BALANCE_THRESHOLD_PERCENT,
    CPU_DEMAND_MULTIPLIERS,
)


def make_cpu(name: str, score: int) -> MagicMock:
    """
    Factory helper: construieste un obiect CPU simulat.

    Centralizam crearea mock-urilor intr-o functie helper pentru
    a evita repetitia in fiecare test (principiul DRY aplicat si in teste).

    Args:
        name: Numele procesorului (folosit in mesajele de eroare)
        score: single_core_score pe scala [1, 100]

    Returns:
        MagicMock care se comporta ca un obiect CPU din models.py
    """
    cpu = MagicMock()
    cpu.name = name
    cpu.single_core_score = score
    return cpu


def make_gpu(name: str, score: int) -> MagicMock:
    """
    Factory helper: construieste un obiect GPU simulat.

    Args:
        name: Numele placii video
        score: render_score pe scala [1, 100]

    Returns:
        MagicMock care se comporta ca un obiect GPU din models.py
    """
    gpu = MagicMock()
    gpu.name = name
    gpu.render_score = score
    return gpu


class TestCalculateBottleneckCpuBottleneck(TestCase):
    """
    Grupa de teste pentru scenariul CPU Bottleneck.

    Conditie: cpu.single_core_score < gpu.render_score * cpu_demand_multiplier
    Exemplu real: i5-13600K (80) + RTX 4090 (100) la 1440p
      Cerere = 100 * 1.0 = 100 > Oferta = 80 → CPU Bottleneck
    """

    def setUp(self):
        """
        setUp() este apelat automat inainte de FIECARE metoda de test.
        Definim aici datele comune pentru toate testele din aceasta clasa.
        """
        # i5-13600K: scor 80 — nu poate tine pasul cu RTX 4090 la 1440p
        self.cpu = make_cpu("Core i5-13600K", score=80)
        # RTX 4090: scor 100 — cel mai puternic GPU din setul nostru
        self.gpu = make_gpu("RTX 4090 Founders Edition", score=100)
        self.resolution = "1440p"

    def test_bottleneck_component_is_cpu(self):
        """Componenta limitanta trebuie sa fie CPU."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.bottleneck_component, "CPU")

    def test_bottleneck_percentage_is_correct(self):
        """
        Verifica formula matematica exact.

        Calcul manual:
          cpu_required = 100 * 1.0 = 100.0  (Cerere)
          cpu_offered  = 80                  (Oferta)
          bottleneck   = (100 - 80) / 100 * 100 = 20.0%
        """
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertAlmostEqual(result.bottleneck_percentage, 20.0, places=1)

    def test_cpu_required_is_calculated_correctly(self):
        """cpu_required = render_score * multiplicator_rezolutie."""
        multiplier = CPU_DEMAND_MULTIPLIERS[self.resolution]  # 1.0 pentru 1440p
        expected_required = self.gpu.render_score * multiplier

        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertAlmostEqual(result.cpu_required,
                               expected_required, places=2)

    def test_interpretation_mentions_cpu_name(self):
        """Mesajul de interpretare trebuie sa mentioneze numele CPU-ului."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertIn("Core i5-13600K", result.interpretation)

    def test_cpu_score_in_result_matches_input(self):
        """Scorul CPU din rezultat trebuie sa fie identic cu cel din input."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.cpu_score, 80)


class TestCalculateBottleneckGpuBottleneck(TestCase):
    """
    Grupa de teste pentru scenariul GPU Bottleneck (scenariu sanatos in gaming).

    Conditie: cpu.single_core_score >= gpu.render_score * cpu_demand_multiplier
    Exemplu: i9-13900K (100) + RTX 4070 (65) la 1440p
      Cerere = 65 * 1.0 = 65 < Oferta = 100 → GPU Bottleneck
    """

    def setUp(self):
        self.cpu = make_cpu("Core i9-13900K", score=100)
        self.gpu = make_gpu("RTX 4070", score=65)
        self.resolution = "1440p"

    def test_bottleneck_component_is_gpu(self):
        """Componenta limitanta trebuie sa fie GPU."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.bottleneck_component, "GPU")

    def test_bottleneck_percentage_is_correct(self):
        """
        Calcul manual:
          cpu_required = 65 * 1.0 = 65.0
          cpu_offered  = 100
          bottleneck   = (100 - 65) / 100 * 100 = 35.0%
        """
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertAlmostEqual(result.bottleneck_percentage, 35.0, places=1)

    def test_gpu_score_in_result_matches_input(self):
        """Scorul GPU din rezultat trebuie sa fie identic cu cel din input."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.gpu_score, 65)

    def test_resolution_is_preserved_in_result(self):
        """Rezolutia trebuie pastrata in obiectul rezultat."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.resolution, "1440p")


class TestCalculateBottleneckEchilibrat(TestCase):
    """
    Grupa de teste pentru scenariul Echilibrat.

    Conditie: diferenta procentuala < BALANCE_THRESHOLD_PERCENT (10%)
    Exemplu: Ryzen 5 7600X (82) + RX 7800 XT (63) la 1080p
      Cerere = 63 * 1.2 = 75.6
      Oferta = 82
      Diferenta = (82 - 75.6) / 82 * 100 = 7.8% < 10% → Echilibrat
    """

    def setUp(self):
        self.cpu = make_cpu("Ryzen 5 7600X", score=82)
        self.gpu = make_gpu("RX 7800 XT", score=63)
        self.resolution = "1080p"

    def test_bottleneck_component_is_echilibrat(self):
        """
        Sub pragul de 10%, sistemul trebuie clasificat ca Echilibrat,
        nu ca GPU sau CPU Bottleneck.
        """
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertEqual(result.bottleneck_component, "Echilibrat")

    def test_percentage_is_below_threshold(self):
        """Procentul calculat trebuie sa fie sub pragul definit in service."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        self.assertLess(result.bottleneck_percentage,
                        BALANCE_THRESHOLD_PERCENT)

    def test_interpretation_contains_echilibrat(self):
        """Mesajul trebuie sa comunice ca sistemul este echilibrat."""
        result = calculate_bottleneck(self.cpu, self.gpu, self.resolution)
        # Verificam ca mesajul contine cuvantul cheie (case-insensitive)
        self.assertIn("echilibrat", result.interpretation.lower())


class TestCalculateBottleneckRezolutieEffect(TestCase):
    """
    Grupa de teste care verifica efectul schimbarii rezolutiei
    asupra aceluiasi set de componente.

    Aceasta grupa demonstreaza un principiu cheie al sistemului:
    rezolutia schimba dinamic cine este bottleneck-ul.
    """

    def setUp(self):
        # i5-13600K + RTX 4090: pereche dezechilibrata, sensibila la rezolutie
        self.cpu = make_cpu("Core i5-13600K", score=80)
        self.gpu = make_gpu("RTX 4090 Founders Edition", score=100)

    def test_1080p_produces_higher_cpu_demand_than_4k(self):
        """
        La 1080p, cerinta de CPU trebuie sa fie mai mare decat la 4K,
        deoarece multiplicatorul 1080p (1.2) > multiplicatorul 4K (0.6).
        """
        result_1080p = calculate_bottleneck(self.cpu, self.gpu, "1080p")
        result_4k = calculate_bottleneck(self.cpu, self.gpu, "4K")

        self.assertGreater(result_1080p.cpu_required, result_4k.cpu_required)

    def test_same_cpu_gpu_different_resolution_can_change_bottleneck(self):
        """
        i5 + RTX 4090 la 1080p → CPU Bottleneck (cerere 120 > oferta 80)
        i5 + RTX 4090 la 4K    → GPU Bottleneck (cerere 60 < oferta 80)

        Acelasi hardware, rezolutie diferita, bottleneck diferit.
        Acesta este cel mai important comportament de demonstrat.
        """
        result_1080p = calculate_bottleneck(self.cpu, self.gpu, "1080p")
        result_4k = calculate_bottleneck(self.cpu, self.gpu, "4K")

        self.assertEqual(result_1080p.bottleneck_component, "CPU")
        self.assertEqual(result_4k.bottleneck_component, "GPU")


class TestCalculateBottleneckValidareInputuri(TestCase):
    """
    Grupa de teste pentru validarea inputurilor invalide.

    Testam ca functia arunca exceptii clare si descriptive
    pentru date incorecte — robustete si UX de debugging.
    """

    def setUp(self):
        self.cpu_valid = make_cpu("CPU Valid", score=80)
        self.gpu_valid = make_gpu("GPU Valid", score=65)

    def test_rezolutie_invalida_arunca_value_error(self):
        """O rezolutie necunoscuta trebuie sa produca ValueError."""
        with self.assertRaises(ValueError) as ctx:
            calculate_bottleneck(self.cpu_valid, self.gpu_valid, "8K")

        # Verificam ca mesajul de eroare este util
        self.assertIn("8K", str(ctx.exception))

    def test_cpu_score_zero_arunca_value_error(self):
        """Un CPU cu scorul 0 (neintrodus in DB) trebuie detectat."""
        cpu_fara_scor = make_cpu("CPU Nesetat", score=0)

        with self.assertRaises(ValueError) as ctx:
            calculate_bottleneck(cpu_fara_scor, self.gpu_valid, "1440p")

        self.assertIn("CPU Nesetat", str(ctx.exception))

    def test_gpu_score_peste_100_arunca_value_error(self):
        """Un scor in afara scalei [1,100] trebuie rejectat."""
        gpu_invalid = make_gpu("GPU Invalid", score=150)

        with self.assertRaises(ValueError):
            calculate_bottleneck(self.cpu_valid, gpu_invalid, "1440p")

    def test_scor_la_limita_inferioara_este_valid(self):
        """Scorul 1 (limita minima) trebuie acceptat fara eroare."""
        cpu_slab = make_cpu("CPU Minim", score=1)
        gpu_slab = make_gpu("GPU Minim", score=1)

        # Nu trebuie sa arunce exceptie
        try:
            result = calculate_bottleneck(cpu_slab, gpu_slab, "1440p")
            self.assertIsNotNone(result)
        except ValueError:
            self.fail(
                "calculate_bottleneck a aruncat ValueError pentru scor valid (1)")

    def test_scor_la_limita_superioara_este_valid(self):
        """Scorul 100 (limita maxima) trebuie acceptat fara eroare."""
        cpu_top = make_cpu("CPU Maxim", score=100)
        gpu_top = make_gpu("GPU Maxim", score=100)

        try:
            result = calculate_bottleneck(cpu_top, gpu_top, "1440p")
            self.assertIsNotNone(result)
        except ValueError:
            self.fail(
                "calculate_bottleneck a aruncat ValueError pentru scor valid (100)")
