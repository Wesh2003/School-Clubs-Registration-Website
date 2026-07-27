from faker import Faker
import random
import datetime
from sqlalchemy.orm import sessionmaker
from models import db, Users

from app import app  # Import the Flask app to get the context

fake = Faker()

with app.app_context():
    db.session.query(Users).delete()


    botw = Users(first_name='Harry', last_name='Potter', email='harry@gmail.com', password='HP3223')
    db.session.add(botw)
    db.session.commit()

    # Seeding users
    for _ in range(10):
        user = Users(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.email(), 
            password=fake.password(), 
            date_added=datetime.datetime.now()
        )
        db.session.add(user)

    # Seeding jobs
    job_titles = ['Bathing & Fur Brushing', 'Haircut & Styling', 'Ear cleaning & Teeth brushing',
                  'Flea & tick treatments', 'Overnight pet boarding', 'In-home pet sitting',
                  'Private dog walking', 'Group dog walking', 'Vaccination check-up', 
                  'Puppy training', 'General checkups', 'Spaying and neutering']
    job_locations = ['Nairobi', 'Nakuru', 'Mombasa', 'Kitui', 'Eldoret', 'Kisumu', 'Meru',
                   'Nyeri', 'Machakos', 'Thika', 'Malindi', 'Lamu', 'Kajiado', 'Embu']
    
    for _ in range(20):
        job = Job(
            title=random.choice(job_titles),
            description=fake.sentence(),
            location=random.choice(job_locations),
            cost=random.randint(500, 3000),
            date_added=datetime.datetime.now()
        )
        db.session.add(job)



    # Commit all
    db.session.commit()

    print("Database seeded successfully!")