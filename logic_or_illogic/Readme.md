cd logic_or_illogic
pip install -r requirements.txt
cp .env.example .env
export DJANGO_DEBUG=1
python manage.py migrate
python manage.py seed_questions
python manage.py runserver



ya Sirf ya kro 
python manage.py runserver