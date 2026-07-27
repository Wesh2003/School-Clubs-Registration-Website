from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

# 1. Users (Regular users who can join clubs)
class Users(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    date_added = db.Column(db.DateTime, default=func.current_timestamp())
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    memberships = db.relationship('Membership', backref='user', lazy=True, cascade="all, delete-orphan")
    club_applications = db.relationship('ClubApplication', foreign_keys='ClubApplication.user_id', backref='applicant', lazy=True)
    announcements = db.relationship('Announcement', backref='author', lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "date_added": self.date_added.strftime('%Y-%m-%d %H:%M:%S') if self.date_added else None
        }

# 2. Admins (Website administrators)
class Admins(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    date_added = db.Column(db.DateTime, default=func.current_timestamp())
    is_super_admin = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_super_admin": self.is_super_admin
        }

# 3. Clubs
class Clubs(db.Model):
    __tablename__ = 'clubs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    meeting_day = db.Column(db.String(20))
    meeting_time = db.Column(db.String(50))
    meeting_location = db.Column(db.String(200))
    email = db.Column(db.String(120))
    faculty_advisor = db.Column(db.String(100))
    max_members = db.Column(db.Integer, default=100)
    is_active = db.Column(db.Boolean, default=True)
    date_added = db.Column(db.DateTime, default=func.current_timestamp())
    created_by = db.Column(db.Integer, db.ForeignKey('admins.id'))
    
    # Relationships
    memberships = db.relationship('Membership', backref='club', lazy=True, cascade="all, delete-orphan")
    applications = db.relationship('ClubApplication', backref='club', lazy=True, cascade="all, delete-orphan")
    announcements = db.relationship('Announcement', backref='club', lazy=True, cascade="all, delete-orphan")
    club_leaders = db.relationship('ClubLeaders', backref='club', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "meeting_day": self.meeting_day,
            "meeting_time": self.meeting_time,
            "meeting_location": self.meeting_location,
            "email": self.email,
            "faculty_advisor": self.faculty_advisor,
            "max_members": self.max_members,
            "is_active": self.is_active,
            "date_added": self.date_added.strftime('%Y-%m-%d %H:%M:%S') if self.date_added else None
        }

# 4. Club Leaders (Club leaders/managers)
class ClubLeaders(db.Model):
    __tablename__ = 'club_leaders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)
    position = db.Column(db.String(50), default='President')  # President, Vice President, Secretary, Treasurer
    is_current = db.Column(db.Boolean, default=True)
    assigned_date = db.Column(db.DateTime, default=func.current_timestamp())
    term_end = db.Column(db.DateTime)
    
    # Relationships
    user = db.relationship('Users', backref='leadership_roles')
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "club_id": self.club_id,
            "position": self.position,
            "is_current": self.is_current,
            "assigned_date": self.assigned_date.strftime('%Y-%m-%d %H:%M:%S') if self.assigned_date else None,
            "term_end": self.term_end.strftime('%Y-%m-%d %H:%M:%S') if self.term_end else None
        }

# 5. Membership (User-club relationship)
class Membership(db.Model):
    __tablename__ = 'memberships'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id', ondelete='CASCADE'), nullable=False)
    join_date = db.Column(db.DateTime, default=func.current_timestamp())
    status = db.Column(db.String(20), default='active')  # active, inactive
    role = db.Column(db.String(50), default='member')
    
    __table_args__ = (db.UniqueConstraint('user_id', 'club_id', name='unique_membership'),)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "club_id": self.club_id,
            "join_date": self.join_date.strftime('%Y-%m-%d %H:%M:%S') if self.join_date else None,
            "status": self.status,
            "role": self.role,
            "club_name": self.club.name if self.club else None,
            "user_name": f"{self.user.first_name} {self.user.last_name}" if self.user else None
        }

# 6. Club Applications
class ClubApplication(db.Model):
    __tablename__ = 'club_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id', ondelete='CASCADE'), nullable=False)
    application_date = db.Column(db.DateTime, default=func.current_timestamp())
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    reason_for_joining = db.Column(db.Text)
    skills = db.Column(db.Text)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_date = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)
    
    reviewer = db.relationship('Users', foreign_keys=[reviewed_by], backref='reviewed_applications')
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "club_id": self.club_id,
            "application_date": self.application_date.strftime('%Y-%m-%d %H:%M:%S') if self.application_date else None,
            "status": self.status,
            "reason_for_joining": self.reason_for_joining,
            "skills": self.skills,
            "reviewed_by": self.reviewed_by,
            "review_date": self.review_date.strftime('%Y-%m-%d %H:%M:%S') if self.review_date else None,
            "review_notes": self.review_notes,
            "applicant_name": f"{self.applicant.first_name} {self.applicant.last_name}" if self.applicant else None,
            "club_name": self.club.name if self.club else None
        }

# 7. Announcements
class Announcement(db.Model):
    __tablename__ = 'announcements'
    
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id', ondelete='CASCADE'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    posted_date = db.Column(db.DateTime, default=func.current_timestamp())
    is_pinned = db.Column(db.Boolean, default=False)
    is_global = db.Column(db.Boolean, default=False)  # True = website-wide announcement
    
    def to_dict(self):
        return {
            "id": self.id,
            "club_id": self.club_id,
            "title": self.title,
            "content": self.content,
            "posted_by": self.posted_by,
            "posted_by_name": f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            "posted_date": self.posted_date.strftime('%Y-%m-%d %H:%M:%S') if self.posted_date else None,
            "is_pinned": self.is_pinned,
            "is_global": self.is_global,
            "club_name": self.club.name if self.club else None
        }