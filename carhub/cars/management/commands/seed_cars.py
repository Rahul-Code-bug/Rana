from django.core.management.base import BaseCommand
from cars.models import Category, Car


SAMPLE_CATEGORIES = ["Sedan", "SUV", "Hatchback", "Electric", "Luxury"]

SAMPLE_CARS = [
    ("Toyota", "Camry", "Sedan", 2023, 2850000, 12000, "petrol", "automatic", "White", True,
     "A refined, fuel-efficient sedan with a spacious cabin and top safety ratings."),
    ("Honda", "City", "Sedan", 2022, 1350000, 22000, "petrol", "manual", "Silver", False,
     "Compact and comfortable, ideal for city driving with great mileage."),
    ("Hyundai", "Creta", "SUV", 2023, 1550000, 8000, "diesel", "automatic", "Black", True,
     "A feature-packed compact SUV with a bold design and strong road presence."),
    ("Tata", "Nexon EV", "Electric", 2024, 1650000, 3000, "electric", "automatic", "Blue", True,
     "All-electric crossover with a long range and quick charging support."),
    ("Mahindra", "Thar", "SUV", 2023, 1650000, 15000, "diesel", "manual", "Red", False,
     "Rugged off-roader built for adventure with a convertible top option."),
    ("Maruti Suzuki", "Swift", "Hatchback", 2022, 750000, 30000, "petrol", "manual", "Yellow", False,
     "Sporty hatchback known for its peppy engine and low running costs."),
    ("BMW", "3 Series", "Luxury", 2023, 5200000, 9000, "petrol", "automatic", "Grey", True,
     "A driver-focused luxury sedan combining performance with premium comfort."),
    ("Kia", "Seltos", "SUV", 2022, 1450000, 18000, "petrol", "automatic", "White", False,
     "Stylish mid-size SUV loaded with connected-car tech and safety features."),
    ("Skoda", "Slavia", "Sedan", 2023, 1500000, 11000, "petrol", "manual", "Grey", False,
     "German-engineered sedan offering a solid ride and generous boot space."),
    ("MG", "Comet EV", "Electric", 2024, 799000, 2000, "electric", "automatic", "Blue", True,
     "A compact city-friendly EV that's easy to park and cheap to run."),
    ("Mercedes-Benz", "C-Class", "Luxury", 2023, 6500000, 6000, "petrol", "automatic", "Black", False,
     "Elegant luxury sedan with a plush interior and cutting-edge tech."),
    ("Renault", "Kwid", "Hatchback", 2021, 480000, 35000, "petrol", "manual", "Orange", False,
     "Budget-friendly hatchback with SUV-inspired styling."),
]


class Command(BaseCommand):
    help = "Seed the database with sample car listings"

    def handle(self, *args, **options):
        cat_map = {}
        for name in SAMPLE_CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=name)
            cat_map[name] = cat

        created = 0
        for brand, model_name, cat_name, year, price, mileage, fuel, trans, color, featured, desc in SAMPLE_CARS:
            _, was_created = Car.objects.get_or_create(
                brand=brand,
                model_name=model_name,
                year=year,
                defaults=dict(
                    category=cat_map[cat_name],
                    price=price,
                    mileage=mileage,
                    fuel_type=fuel,
                    transmission=trans,
                    color=color,
                    is_featured=featured,
                    description=desc,
                ),
            )
            created += int(was_created)

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new cars ({len(SAMPLE_CARS)} total in sample set)."))
