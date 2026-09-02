from django.core.management.base import BaseCommand
from components.models import (
    Socket, RamType, FormFactor,
    CPU, Motherboard, RAM, GPU, PSU, Case
)

BRAND_GSKILL = "G.Skill"
BRAND_LIAN_LI = "Lian Li"


class Command(BaseCommand):
    help = "Populeaza baza de date cu date mock pentru testare."

    def handle(self, *args, **options):
        self.stdout.write("Incepem popularea bazei de date...\n")
        self._seed_lookup_tables()
        self._seed_cpus()
        self._seed_motherboards()
        self._seed_ram()
        self._seed_gpus()
        self._seed_psus()
        self._seed_cases()
        self.stdout.write(self.style.SUCCESS("\nSeeding complet!"))

    def _seed_lookup_tables(self):
        self.stdout.write("  Lookup tables...")
        for name in ["LGA1700", "AM5"]:
            Socket.objects.get_or_create(name=name)
        for name in ["DDR4", "DDR5"]:
            RamType.objects.get_or_create(name=name)
        for name in ["ATX", "mATX", "ITX"]:
            FormFactor.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS("    Done"))

    def _seed_cpus(self):
        self.stdout.write("  CPU-uri...")
        lga1700 = Socket.objects.get(name="LGA1700")
        am5     = Socket.objects.get(name="AM5")

        cpus_data = [
            # --- Originale ---
            {"name": "Core i5-13600K",  "brand": "Intel", "socket": lga1700, "tdp_watts": 125, "has_integrated_gpu": True,  "single_core_score": 80},
            {"name": "Core i9-13900K",  "brand": "Intel", "socket": lga1700, "tdp_watts": 253, "has_integrated_gpu": True,  "single_core_score": 100},
            {"name": "Ryzen 5 7600X",   "brand": "AMD",   "socket": am5,     "tdp_watts": 105, "has_integrated_gpu": False, "single_core_score": 82},
            {"name": "Ryzen 9 7950X",   "brand": "AMD",   "socket": am5,     "tdp_watts": 170, "has_integrated_gpu": False, "single_core_score": 91},
            # --- Noi Intel LGA1700 ---
            {"name": "Core i9-14900K",  "brand": "Intel", "socket": lga1700, "tdp_watts": 125, "has_integrated_gpu": True,  "single_core_score": 103},
            {"name": "Core i7-14700K",  "brand": "Intel", "socket": lga1700, "tdp_watts": 125, "has_integrated_gpu": True,  "single_core_score": 95},
            {"name": "Core i5-14600K",  "brand": "Intel", "socket": lga1700, "tdp_watts": 125, "has_integrated_gpu": True,  "single_core_score": 83},
            {"name": "Core i3-13100",   "brand": "Intel", "socket": lga1700, "tdp_watts": 60,  "has_integrated_gpu": True,  "single_core_score": 68},
            # --- Noi AMD AM5 ---
            {"name": "Ryzen 9 7900X",   "brand": "AMD",   "socket": am5,     "tdp_watts": 170, "has_integrated_gpu": False, "single_core_score": 89},
            {"name": "Ryzen 7 7700X",   "brand": "AMD",   "socket": am5,     "tdp_watts": 105, "has_integrated_gpu": False, "single_core_score": 86},
            {"name": "Ryzen 5 7600",    "brand": "AMD",   "socket": am5,     "tdp_watts": 65,  "has_integrated_gpu": False, "single_core_score": 80},
            {"name": "Ryzen 7 7800X3D", "brand": "AMD",   "socket": am5,     "tdp_watts": 120, "has_integrated_gpu": False, "single_core_score": 88},
        ]

        for data in cpus_data:
            CPU.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(cpus_data)} CPU-uri"))

    def _seed_motherboards(self):
        self.stdout.write("  Motherboard-uri...")
        lga1700 = Socket.objects.get(name="LGA1700")
        am5     = Socket.objects.get(name="AM5")
        ddr4    = RamType.objects.get(name="DDR4")
        ddr5    = RamType.objects.get(name="DDR5")
        atx     = FormFactor.objects.get(name="ATX")
        matx    = FormFactor.objects.get(name="mATX")
        itx     = FormFactor.objects.get(name="ITX")

        mbs_data = [
            # --- Originale ---
            {"name": "Z790 Tomahawk WiFi",  "brand": "MSI",     "socket": lga1700, "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            {"name": "B660M Pro RS",         "brand": "ASRock",  "socket": lga1700, "ram_type": ddr4, "form_factor": matx, "ram_slots": 4, "max_ram_gb": 64},
            {"name": "X670E Extreme",        "brand": "ASRock",  "socket": am5,     "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            {"name": "B650M Mortar WiFi",    "brand": "MSI",     "socket": am5,     "ram_type": ddr5, "form_factor": matx, "ram_slots": 4, "max_ram_gb": 128},
            # --- Noi Intel LGA1700 DDR5 ---
            {"name": "ROG Strix Z790-E",     "brand": "ASUS",    "socket": lga1700, "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            {"name": "Z790 Aorus Elite AX",  "brand": "Gigabyte","socket": lga1700, "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            # --- Noi Intel LGA1700 DDR4 ---
            {"name": "TUF Gaming B760M-Plus","brand": "ASUS",    "socket": lga1700, "ram_type": ddr4, "form_factor": matx, "ram_slots": 4, "max_ram_gb": 128},
            {"name": "H610M S2H",            "brand": "Gigabyte","socket": lga1700, "ram_type": ddr4, "form_factor": matx, "ram_slots": 2, "max_ram_gb": 64},
            # --- Noi AMD AM5 ---
            {"name": "ROG Crosshair X670E",  "brand": "ASUS",    "socket": am5,     "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            {"name": "MEG X670E ACE",        "brand": "MSI",     "socket": am5,     "ram_type": ddr5, "form_factor": atx,  "ram_slots": 4, "max_ram_gb": 128},
            {"name": "B650M Aorus Pro",      "brand": "Gigabyte","socket": am5,     "ram_type": ddr5, "form_factor": matx, "ram_slots": 4, "max_ram_gb": 128},
            {"name": "B650I Aorus Ultra",    "brand": "Gigabyte","socket": am5,     "ram_type": ddr5, "form_factor": itx,  "ram_slots": 2, "max_ram_gb": 64},
        ]

        for data in mbs_data:
            Motherboard.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(mbs_data)} Motherboard-uri"))

    def _seed_ram(self):
        self.stdout.write("  Module RAM...")
        ddr4 = RamType.objects.get(name="DDR4")
        ddr5 = RamType.objects.get(name="DDR5")

        rams_data = [
            # --- Originale ---
            {"name": "Vengeance 16GB DDR4-3200",  "brand": "Corsair",  "ram_type": ddr4, "capacity_gb": 16, "speed_mhz": 3200, "tdp_watts": 3},
            {"name": "Trident Z5 16GB DDR5-6000",  "brand": BRAND_GSKILL,  "ram_type": ddr5, "capacity_gb": 16, "speed_mhz": 6000, "tdp_watts": 5},
            {"name": "Fury Beast 32GB DDR5-5200",  "brand": "Kingston", "ram_type": ddr5, "capacity_gb": 32, "speed_mhz": 5200, "tdp_watts": 7},
            # --- Noi DDR5 ---
            {"name": "Trident Z5 32GB DDR5-6400",  "brand": BRAND_GSKILL,   "ram_type": ddr5, "capacity_gb": 32, "speed_mhz": 6400, "tdp_watts": 6},
            {"name": "Dominator Platinum 32GB DDR5-5600", "brand": "Corsair", "ram_type": ddr5, "capacity_gb": 32, "speed_mhz": 5600, "tdp_watts": 6},
            {"name": "Vengeance 16GB DDR5-4800",   "brand": "Corsair",   "ram_type": ddr5, "capacity_gb": 16, "speed_mhz": 4800, "tdp_watts": 4},
            {"name": "Fury Renegade 32GB DDR5-6000","brand": "Kingston", "ram_type": ddr5, "capacity_gb": 32, "speed_mhz": 6000, "tdp_watts": 6},
            {"name": "Lancer 32GB DDR5-5200",      "brand": "TeamGroup", "ram_type": ddr5, "capacity_gb": 32, "speed_mhz": 5200, "tdp_watts": 5},
            # --- Noi DDR4 ---
            {"name": "Vengeance LPX 32GB DDR4-3200","brand": "Corsair",  "ram_type": ddr4, "capacity_gb": 32, "speed_mhz": 3200, "tdp_watts": 4},
            {"name": "Ripjaws V 16GB DDR4-3600",   "brand": BRAND_GSKILL,   "ram_type": ddr4, "capacity_gb": 16, "speed_mhz": 3600, "tdp_watts": 3},
            {"name": "Fury Beast 32GB DDR4-3200",  "brand": "Kingston",  "ram_type": ddr4, "capacity_gb": 32, "speed_mhz": 3200, "tdp_watts": 4},
        ]

        for data in rams_data:
            RAM.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(rams_data)} module RAM"))

    def _seed_gpus(self):
        self.stdout.write("  GPU-uri...")

        gpus_data = [
            # --- Originale ---
            {"name": "RTX 4070",                  "brand": "NVIDIA", "length_mm": 285, "tdp_watts": 200, "render_score": 65},
            {"name": "RTX 4090 Founders Edition", "brand": "NVIDIA", "length_mm": 336, "tdp_watts": 450, "render_score": 100},
            {"name": "RX 7800 XT",                "brand": "AMD",    "length_mm": 267, "tdp_watts": 263, "render_score": 63},
            # --- Noi NVIDIA ---
            {"name": "RTX 4080 Super",            "brand": "NVIDIA", "length_mm": 340, "tdp_watts": 320, "render_score": 90},
            {"name": "RTX 4070 Ti Super",         "brand": "NVIDIA", "length_mm": 305, "tdp_watts": 285, "render_score": 80},
            {"name": "RTX 4070 Super",            "brand": "NVIDIA", "length_mm": 285, "tdp_watts": 220, "render_score": 73},
            {"name": "RTX 4060 Ti",               "brand": "NVIDIA", "length_mm": 240, "tdp_watts": 165, "render_score": 55},
            {"name": "RTX 4060",                  "brand": "NVIDIA", "length_mm": 240, "tdp_watts": 115, "render_score": 45},
            # --- Noi AMD ---
            {"name": "RX 7900 XTX",               "brand": "AMD",    "length_mm": 287, "tdp_watts": 355, "render_score": 88},
            {"name": "RX 7900 XT",                "brand": "AMD",    "length_mm": 276, "tdp_watts": 315, "render_score": 82},
            {"name": "RX 7700 XT",                "brand": "AMD",    "length_mm": 239, "tdp_watts": 245, "render_score": 58},
            {"name": "RX 7600",                   "brand": "AMD",    "length_mm": 200, "tdp_watts": 165, "render_score": 42},
        ]

        for data in gpus_data:
            GPU.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(gpus_data)} GPU-uri"))

    def _seed_psus(self):
        self.stdout.write("  Surse de alimentare...")

        psus_data = [
            # --- Originale ---
            {"name": "RM750x",               "brand": "Corsair",     "wattage": 750},
            {"name": "Toughpower GF3 1000W", "brand": "Thermaltake", "wattage": 1000},
            {"name": "SuperNOVA 550 G6",     "brand": "EVGA",        "wattage": 550},
            # --- Noi ---
            {"name": "RM1000x",              "brand": "Corsair",     "wattage": 1000},
            {"name": "RM850x",               "brand": "Corsair",     "wattage": 850},
            {"name": "Focus GX-850",         "brand": "Seasonic",    "wattage": 850},
            {"name": "Focus GX-1000",        "brand": "Seasonic",    "wattage": 1000},
            {"name": "Dark Power 13 850W",   "brand": "be quiet!",   "wattage": 850},
            {"name": "MAG A850GL PCIE5",     "brand": "MSI",         "wattage": 850},
            {"name": "SuperNOVA 850 G6",     "brand": "EVGA",        "wattage": 850},
            {"name": "Toughpower PF1 750W",  "brand": "Thermaltake", "wattage": 750},
        ]

        for data in psus_data:
            PSU.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(psus_data)} PSU-uri"))

    def _seed_cases(self):
        self.stdout.write("  Carcase...")
        atx  = FormFactor.objects.get(name="ATX")
        matx = FormFactor.objects.get(name="mATX")
        itx  = FormFactor.objects.get(name="ITX")

        cases_data = [
            # --- Originale ---
            {"name": "5000D Airflow",     "brand": "Corsair",       "supported_form_factor": atx,  "max_gpu_length_mm": 420},
            {"name": "H510",              "brand": "NZXT",           "supported_form_factor": matx, "max_gpu_length_mm": 381},
            {"name": "Dan A4-SFX",        "brand": BRAND_LIAN_LI,        "supported_form_factor": itx,  "max_gpu_length_mm": 295},
            # --- Noi ATX ---
            {"name": "Meshify 2",         "brand": "Fractal",        "supported_form_factor": atx,  "max_gpu_length_mm": 467},
            {"name": "PC-O11 Dynamic EVO","brand": BRAND_LIAN_LI,        "supported_form_factor": atx,  "max_gpu_length_mm": 420},
            {"name": "H7 Flow",           "brand": "NZXT",           "supported_form_factor": atx,  "max_gpu_length_mm": 400},
            {"name": "Pure Base 500DX",   "brand": "be quiet!",      "supported_form_factor": atx,  "max_gpu_length_mm": 369},
            {"name": "4000D Airflow",     "brand": "Corsair",        "supported_form_factor": atx,  "max_gpu_length_mm": 360},
            # --- Noi mATX ---
            {"name": "Torrent Compact",   "brand": "Fractal",        "supported_form_factor": matx, "max_gpu_length_mm": 331},
            {"name": "H510i",             "brand": "NZXT",           "supported_form_factor": matx, "max_gpu_length_mm": 360},
            # --- Noi ITX ---
            {"name": "NR200P",            "brand": "Cooler Master",  "supported_form_factor": itx,  "max_gpu_length_mm": 330},
            {"name": "A4-H2O",            "brand": BRAND_LIAN_LI,        "supported_form_factor": itx,  "max_gpu_length_mm": 322},
        ]

        for data in cases_data:
            Case.objects.get_or_create(name=data["name"], brand=data["brand"], defaults=data)

        self.stdout.write(self.style.SUCCESS(f"    {len(cases_data)} carcase"))