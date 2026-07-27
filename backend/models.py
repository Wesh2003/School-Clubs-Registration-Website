from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy import func

db = SQLAlchemy()  # Flask SQLAlchemy instance

# 1. Users (Students/Faculty who can join clubs)
class Users(db.Model):  # Use db.Model instead of declarative_base()
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(255))
    date_added = db.Column(db.DateTime, default=func.current_timestamp())

    # Relationships
    memberships = db.relationship('ClubMembership', backref='member', lazy=True)
    events_attended = db.relationship('EventAttendance', backref='attendee', lazy=True)

class Admins(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(255))
    date_added = db.Column(db.DateTime, default=func.current_timestamp())


# 2. Clubs
class Clubs(db.Model): 
    __tablename__ = 'clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    meeting_day = db.Column(db.String(20))  # Monday, Tuesday, etc.
    meeting_time = db.Column(db.String(50))
    meeting_location = db.Column(db.String(200))
    email = db.Column(db.String(120))
    faculty_advisor = db.Column(db.String(100))
    max_members = db.Column(db.Integer, default=100)
    is_active = db.Column(db.Boolean, default=True)
    date_added = db.Column(db.DateTime, default=func.current_timestamp())

    # Relationships
    memberships = db.relationship('ClubMembership', backref='club', lazy=True)
    events = db.relationship('Event', backref='club', lazy=True)
    officers = db.relationship('ClubOfficer', backref='club', lazy=True)

# 3. Club Membership (Junction table for many-to-many between Users and Clubs)
class Membership(db.Model):
    __tablename__ = 'memberships'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'))
    join_date = db.Column(db.DateTime, default=func.current_timestamp())
    status = db.Column(db.String(20), default='active')  # active, inactive, pending
    role = db.Column(db.String(50), default='member')  # member, officer, president

    __table_args__ = (db.UniqueConstraint('user_id', 'club_id', name='unique_membership'),)

# 4. Club Officers (Leadership positions)
class ClubLeaders(db.Model):
    __tablename__ = 'club_leaders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    position = db.Column(db.String(50))  # President, Vice President, Treasurer, Secretary, etc.
    term_start = db.Column(db.DateTime, default=func.current_timestamp())
    term_end = db.Column(db.DateTime)
    is_current = db.Column(db.Boolean, default=True)
    
    user = db.relationship('User', backref='officer_positions')


# 5. Events
class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    max_attendees = db.Column(db.Integer, default=50)
    is_virtual = db.Column(db.Boolean, default=False)
    virtual_link = db.Column(db.String(500))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_date = db.Column(db.DateTime, default=func.current_timestamp())
    
    # Relationships
    attendees = db.relationship('EventAttendance', backref='event', lazy=True)


# 6. Event Attendance (Junction table for many-to-many between Users and Events)
class EventAttendance(db.Model):
    __tablename__ = 'event_attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rsvp_status = db.Column(db.String(20), default='pending')  # attending, not_attending, pending
    rsvp_date = db.Column(db.DateTime, default=func.current_timestamp())
    
    __table_args__ = (db.UniqueConstraint('event_id', 'user_id', name='unique_event_attendance'),)


# 7. Club Applications (For students applying to join clubs)
class ClubApplication(db.Model):
    __tablename__ = 'club_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=func.current_timestamp())
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    reason_for_joining = db.Column(db.Text)
    skills = db.Column(db.Text)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_date = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)
    
    applicant = db.relationship('User', foreign_keys=[user_id], backref='applications')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])


# 8. Announcements
class Announcement(db.Model):
    __tablename__ = 'announcements'
    
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    posted_date = db.Column(db.DateTime, default=func.current_timestamp())
    is_pinned = db.Column(db.Boolean, default=False)


# 10. Budget/Expenses (For club treasurers)
class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    expense_date = db.Column(db.DateTime, default=func.current_timestamp())
    submitted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected