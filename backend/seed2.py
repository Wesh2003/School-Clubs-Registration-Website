from faker import Faker
import random
import datetime
from sqlalchemy import func
from app2 import app
from models2 import db, Users, Admins, Clubs, ClubLeaders, Membership, ClubApplication, Announcement

fake = Faker()

# List of club names, descriptions, and categories
CLUB_DATA = [
    {
        "name": "Chess Club",
        "description": "A club for chess enthusiasts of all skill levels. We meet weekly to play, learn strategies, and participate in tournaments.",
        "meeting_day": "Monday",
        "meeting_time": "4:00 PM - 6:00 PM",
        "meeting_location": "Room 101, Main Building",
        "faculty_advisor": "Dr. Sarah Johnson",
        "max_members": 50
    },
    {
        "name": "Photography Club",
        "description": "Explore the art of photography through workshops, photo walks, and exhibitions. All skill levels welcome!",
        "meeting_day": "Wednesday",
        "meeting_time": "3:00 PM - 5:00 PM",
        "meeting_location": "Arts Center, Room 205",
        "faculty_advisor": "Prof. Michael Chen",
        "max_members": 40
    },
    {
        "name": "Robotics Club",
        "description": "Build robots, learn coding, and compete in robotics competitions. Great for students interested in engineering and technology.",
        "meeting_day": "Friday",
        "meeting_time": "2:00 PM - 6:00 PM",
        "meeting_location": "Engineering Lab, Room 301",
        "faculty_advisor": "Dr. Robert Williams",
        "max_members": 30
    },
    {
        "name": "Drama Club",
        "description": "Express your creativity through acting, stage production, and playwriting. We put on two major productions each year.",
        "meeting_day": "Tuesday",
        "meeting_time": "4:30 PM - 7:00 PM",
        "meeting_location": "Auditorium",
        "faculty_advisor": "Ms. Amanda Foster",
        "max_members": 60
    },
    {
        "name": "Environmental Club",
        "description": "Promote sustainability and environmental awareness through community cleanups, recycling programs, and educational campaigns.",
        "meeting_day": "Thursday",
        "meeting_time": "3:30 PM - 5:30 PM",
        "meeting_location": "Science Building, Room 150",
        "faculty_advisor": "Dr. Lisa Green",
        "max_members": 45
    },
    {
        "name": "Music Club",
        "description": "A community for musicians and music lovers. We offer jam sessions, music theory workshops, and performance opportunities.",
        "meeting_day": "Monday",
        "meeting_time": "5:00 PM - 7:00 PM",
        "meeting_location": "Music Hall, Room 2",
        "faculty_advisor": "Prof. James Morrison",
        "max_members": 55
    },
    {
        "name": "Debate Club",
        "description": "Sharpen your public speaking and critical thinking skills through regular debates, public speaking exercises, and competitions.",
        "meeting_day": "Wednesday",
        "meeting_time": "4:00 PM - 6:00 PM",
        "meeting_location": "Humanities Building, Room 200",
        "faculty_advisor": "Dr. Patricia Davis",
        "max_members": 35
    },
    {
        "name": "Coding Club",
        "description": "Learn and practice programming through collaborative projects, hackathons, and workshops on various programming languages.",
        "meeting_day": "Friday",
        "meeting_time": "3:00 PM - 6:00 PM",
        "meeting_location": "Computer Lab, Room 401",
        "faculty_advisor": "Prof. David Kim",
        "max_members": 40
    },
    {
        "name": "Art Club",
        "description": "Explore various art mediums including painting, drawing, sculpture, and digital art. Open to all skill levels.",
        "meeting_day": "Tuesday",
        "meeting_time": "3:00 PM - 5:30 PM",
        "meeting_location": "Art Studio, Room 110",
        "faculty_advisor": "Ms. Rachel Thompson",
        "max_members": 50
    },
    {
        "name": "Entrepreneurship Club",
        "description": "Develop business ideas, learn about startups, and network with entrepreneurs. We host guest speakers and pitch competitions.",
        "meeting_day": "Thursday",
        "meeting_time": "5:00 PM - 7:00 PM",
        "meeting_location": "Business School, Room 305",
        "faculty_advisor": "Dr. Mark Stevens",
        "max_members": 40
    },
    {
        "name": "Volleyball Club",
        "description": "A recreational volleyball club focused on fun, fitness, and friendly competition. All skill levels are welcome.",
        "meeting_day": "Wednesday",
        "meeting_time": "6:00 PM - 8:00 PM",
        "meeting_location": "Gymnasium, Court 1",
        "faculty_advisor": "Coach Mike Anderson",
        "max_members": 25
    },
    {
        "name": "Book Club",
        "description": "Read and discuss a wide variety of books, from classics to contemporary literature. New members always welcome!",
        "meeting_day": "Monday",
        "meeting_time": "4:00 PM - 6:00 PM",
        "meeting_location": "Library, Reading Room",
        "faculty_advisor": "Ms. Emily Wilson",
        "max_members": 30
    },
    {
        "name": "Gaming Club",
        "description": "A community for gamers to connect, play, and discuss video games, board games, and tabletop RPGs.",
        "meeting_day": "Friday",
        "meeting_time": "4:00 PM - 9:00 PM",
        "meeting_location": "Student Center, Room 2B",
        "faculty_advisor": "Prof. Thomas Brown",
        "max_members": 50
    },
    {
        "name": "International Culture Club",
        "description": "Celebrate diversity and learn about different cultures through events, food tastings, and cultural exchange activities.",
        "meeting_day": "Tuesday",
        "meeting_time": "4:30 PM - 6:30 PM",
        "meeting_location": "International Center",
        "faculty_advisor": "Dr. Maria Garcia",
        "max_members": 60
    },
    {
        "name": "Dance Club",
        "description": "Learn and practice various dance styles including hip-hop, contemporary, salsa, and more. Join us for fun and fitness!",
        "meeting_day": "Thursday",
        "meeting_time": "5:00 PM - 7:00 PM",
        "meeting_location": "Dance Studio, Arts Center",
        "faculty_advisor": "Ms. Jennifer Lopez",
        "max_members": 35
    }
]

def seed_database():
    with app.app_context():
        # Clear existing data (optional - be careful in production)
        print("Clearing existing data...")
        db.session.query(Announcement).delete()
        db.session.query(ClubApplication).delete()
        db.session.query(Membership).delete()
        db.session.query(ClubLeaders).delete()
        db.session.query(Clubs).delete()
        db.session.query(Users).delete()
        db.session.query(Admins).delete()
        
        # Create admin users
        print("Creating admin users...")
        admin1 = Admins(
            first_name='John',
            last_name='Admin',
            email='admin@clubhub.com',
            password='admin123',  # In production, this should be hashed
            is_super_admin=True
        )
        admin2 = Admins(
            first_name='Sarah',
            last_name='Manager',
            email='sarah@clubhub.com',
            password='manager123',
            is_super_admin=False
        )
        db.session.add(admin1)
        db.session.add(admin2)
        db.session.commit()
        print(f"Created admin: {admin1.email} (Super Admin)")
        print(f"Created admin: {admin2.email}")
        
        # Create regular users
        print("Creating regular users...")
        users = []
        user_data = [
            {"first_name": "Alice", "last_name": "Wonder", "email": "alice@example.com"},
            {"first_name": "Bob", "last_name": "Builder", "email": "bob@example.com"},
            {"first_name": "Charlie", "last_name": "Brown", "email": "charlie@example.com"},
            {"first_name": "Diana", "last_name": "Prince", "email": "diana@example.com"},
            {"first_name": "Eve", "last_name": "Adams", "email": "eve@example.com"},
            {"first_name": "Frank", "last_name": "Castle", "email": "frank@example.com"},
            {"first_name": "Grace", "last_name": "Hopper", "email": "grace@example.com"},
            {"first_name": "Hank", "last_name": "Pym", "email": "hank@example.com"},
            {"first_name": "Ivy", "last_name": "Green", "email": "ivy@example.com"},
            {"first_name": "Jack", "last_name": "Ryan", "email": "jack@example.com"},
        ]
        
        for data in user_data:
            user = Users(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                password='password123',
                is_active=True
            )
            db.session.add(user)
            users.append(user)
        db.session.commit()
        print(f"Created {len(users)} regular users")
        
        # Create clubs
        print("Creating clubs...")
        clubs = []
        for club_data in CLUB_DATA:
            club = Clubs(
                name=club_data["name"],
                description=club_data["description"],
                meeting_day=club_data["meeting_day"],
                meeting_time=club_data["meeting_time"],
                meeting_location=club_data["meeting_location"],
                email=f"{club_data['name'].lower().replace(' ', '')}@clubhub.com",
                faculty_advisor=club_data["faculty_advisor"],
                max_members=club_data["max_members"],
                is_active=True,
                created_by=admin1.id  # Admin created the club
            )
            db.session.add(club)
            clubs.append(club)
        db.session.commit()
        print(f"Created {len(clubs)} clubs")
        
        # Create club leaders (assign random users as leaders of random clubs)
        print("Creating club leaders...")
        for i in range(len(clubs)):
            # Assign 2-3 leaders per club
            num_leaders = random.randint(2, 3)
            available_users = [u for u in users if u.id not in [l.user_id for l in ClubLeaders.query.all()]]
            
            # Take a subset of users for this club
            selected_users = random.sample(available_users, min(num_leaders, len(available_users)))
            
            positions = ['President', 'Vice President', 'Secretary', 'Treasurer']
            
            for idx, user in enumerate(selected_users):
                leader = ClubLeaders(
                    user_id=user.id,
                    club_id=clubs[i].id,
                    position=positions[idx % len(positions)],
                    is_current=True,
                    term_end=datetime.datetime.now() + datetime.timedelta(days=random.randint(180, 365))
                )
                db.session.add(leader)
        db.session.commit()
        print("Club leaders created")
        
        # Create memberships (users join clubs)
        print("Creating memberships...")
        for user in users:
            # Each user joins 2-4 random clubs
            num_clubs = random.randint(2, 4)
            selected_clubs = random.sample(clubs, min(num_clubs, len(clubs)))
            
            for club in selected_clubs:
                membership = Membership(
                    user_id=user.id,
                    club_id=club.id,
                    status='active',
                    role='member'
                )
                db.session.add(membership)
        db.session.commit()
        print("Memberships created")
        
        # Create club applications
        print("Creating club applications...")
        reasons = [
            "I'm passionate about this club's mission and want to contribute.",
            "I've always been interested in this field and want to learn more.",
            "I want to meet like-minded people and build my network.",
            "This club offers great opportunities for personal and professional growth.",
            "I've been following this club's activities and want to join.",
            "I believe I can contribute valuable skills to this club.",
            "I want to gain experience and develop new skills.",
            "I'm looking for a community where I can share my interests."
        ]
        
        for user in users:
            # Each user applies to 1-3 clubs they're not already in
            existing_clubs = [m.club_id for m in Membership.query.filter_by(user_id=user.id).all()]
            available_clubs = [c for c in clubs if c.id not in existing_clubs]
            
            if available_clubs:
                num_apps = random.randint(1, min(3, len(available_clubs)))
                selected_clubs = random.sample(available_clubs, min(num_apps, len(available_clubs)))
                
                for club in selected_clubs:
                    application = ClubApplication(
                        user_id=user.id,
                        club_id=club.id,
                        reason_for_joining=random.choice(reasons),
                        skills=f"Experience: {random.randint(1, 5)} years\nInterests: {fake.job()}\nAchievements: {fake.catch_phrase()}",
                        status=random.choice(['pending', 'approved', 'rejected'])
                    )
                    # Sometimes add review info
                    if application.status in ['approved', 'rejected']:
                        application.reviewed_by = random.choice([u.id for u in users if u.id != user.id])
                        application.review_date = datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 30))
                        application.review_notes = random.choice([
                            "Great fit for the club!",
                            "Welcome to the team!",
                            "We think you'd be a valuable addition.",
                            "Unfortunately, we've reached capacity.",
                            "Your application has been reviewed favorably."
                        ])
                    db.session.add(application)
        db.session.commit()
        print("Applications created")
        
        # Create announcements
        print("Creating announcements...")
        announcement_titles = [
            "Welcome to the new semester!",
            "Club Meeting Schedule Updated",
            "Upcoming Event: Club Fair",
            "New Members Welcome!",
            "Special Announcement from the Leadership",
            "Annual Club Awards Ceremony",
            "Community Service Initiative",
            "Guest Speaker Series Announcement"
        ]
        
        # Global announcements (by admin)
        for i in range(3):
            announcement = Announcement(
                club_id=None,
                title=f"Global: {random.choice(announcement_titles)}",
                content=fake.paragraph(nb_sentences=5),
                posted_by=admin1.id,
                is_global=True,
                is_pinned=i == 0  # First one is pinned
            )
            db.session.add(announcement)
        
        # Club-specific announcements (by club leaders)
        for club in clubs:
            num_announcements = random.randint(2, 4)
            leaders = ClubLeaders.query.filter_by(club_id=club.id, is_current=True).all()
            
            for i in range(num_announcements):
                if leaders:
                    posted_by = random.choice(leaders).user_id
                else:
                    posted_by = random.choice(users).id
                
                announcement = Announcement(
                    club_id=club.id,
                    title=random.choice(announcement_titles),
                    content=fake.paragraph(nb_sentences=5),
                    posted_by=posted_by,
                    is_global=False,
                    is_pinned=i == 0
                )
                db.session.add(announcement)
        
        db.session.commit()
        print("Announcements created")
        
        print("\n✅ Database seeding completed successfully!")
        print(f"Summary:")
        print(f"  - Admins: {Admins.query.count()}")
        print(f"  - Users: {Users.query.count()}")
        print(f"  - Clubs: {Clubs.query.count()}")
        print(f"  - Club Leaders: {ClubLeaders.query.count()}")
        print(f"  - Memberships: {Membership.query.count()}")
        print(f"  - Applications: {ClubApplication.query.count()}")
        print(f"  - Announcements: {Announcement.query.count()}")

if __name__ == "__main__":
    seed_database()