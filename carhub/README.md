# CarHub — Django Car Website

A full car dealership / marketplace website built with Django: browsable inventory with search & filters, car detail pages with an inquiry form, an about page, a contact page, and a Django admin panel for managing listings.

## Features

- **Home page** — hero section, featured cars, latest arrivals, category shortcuts
- **Inventory page** — search by keyword, filter by brand / category / fuel type / price range, sort, pagination
- **Car detail page** — full specs, related cars from the same brand, inquiry form
- **Contact page** — general inquiry form
- **Admin panel** — add/edit cars, categories, and view inquiry messages
- **Sample data command** — seeds 12 example cars across 5 categories
- Dark, modern custom theme built on Bootstrap 5 (no default Bootstrap look)

## Project structure

```
carhub/
├── manage.py
├── requirements.txt
├── carhub/              # project settings, root urls
├── cars/                # the main app
│   ├── models.py        # Category, Car, ContactMessage
│   ├── views.py
│   ├── forms.py
│   ├── urls.py
│   ├── admin.py
│   ├── templates/cars/  # all HTML templates
│   └── management/commands/seed_cars.py
├── static/css/style.css # custom styling
└── media/                # uploaded car images (created at runtime)
```

## Setup

1. **Create a virtual environment and install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run migrations**
   ```bash
   python manage.py migrate
   ```

3. **(Optional) Load sample cars**
   ```bash
   python manage.py seed_cars
   ```

4. **Create an admin user**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the dev server**
   ```bash
   python manage.py runserver
   ```
   Visit `http://127.0.0.1:8000/` for the site and `http://127.0.0.1:8000/admin/` to manage listings.

## Adding cars

Log in to `/admin/`, go to **Cars**, and add a new entry — brand, model, year, price, mileage, fuel type, transmission, description, and an optional photo. Check **is_featured** to have it appear in the homepage's Featured section.

## Notes

- Uses SQLite by default (`db.sqlite3`) — zero config needed to get started. Swap `DATABASES` in `carhub/settings.py` for Postgres/MySQL in production.
- `DEBUG = True` and a placeholder `SECRET_KEY` are set for local development only — change both before deploying.
- Uploaded car images are stored under `media/cars/` and served automatically while `DEBUG = True`.



For Starting this
python -m venv venv
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_cars
python manage.py createsuperuser
python manage.py runserver
http://127.0.0.1:8000/
http://127.0.0.1:8000/admin/
