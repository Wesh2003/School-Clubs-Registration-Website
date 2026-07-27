from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime
from models2 import db, Users, Admins, Clubs, ClubLeaders, Membership, ClubApplication, Announcement

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///club_registration_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# Initialize Extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

# ======================== HELPER FUNCTIONS ========================

def check_club_leader_permission(club_leader_id, club_id):
    """Check if a club leader manages a specific club"""
    leader = ClubLeaders.query.filter_by(user_id=club_leader_id, club_id=club_id, is_current=True).first()
    return leader is not None

def is_admin(user_id):
    """Check if a user is an admin"""
    admin = Admins.query.get(user_id)
    return admin is not None

# ======================== HOME ROUTE ========================

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Club Registration API!"}), 200

# ======================== USER ROUTES ========================

@app.route("/userregister", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ["first_name", "last_name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if email already exists
        if Users.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = Users(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!", "user_id": new_user.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/userlogin", methods=["POST"])
def login_user():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = Users.query.filter_by(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                "access_token": access_token,
                "user_id": user.id,
                "role": "user"
            }), 200
        
        return jsonify({"error": "Invalid credentials"}), 401
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            # Check if email already exists for another user
            existing_user = Users.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({"error": "Email already in use"}), 400
            user.email = data["email"]
        
        db.session.commit()
        return jsonify({"message": "User updated successfully", "user": user.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ======================== ADMIN ROUTES ========================

@app.route("/adminregister", methods=["POST"])
def register_admin():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ["first_name", "last_name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        if Admins.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_admin = Admins(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password,
            is_super_admin=data.get('is_super_admin', False)
        )
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({"message": "Admin registered successfully!", "admin_id": new_admin.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/adminlogin", methods=["POST"])
def login_admin():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        admin = Admins.query.filter_by(email=data['email']).first()
        
        if admin and bcrypt.check_password_hash(admin.password, data['password']):
            access_token = create_access_token(identity=str(admin.id))
            return jsonify({
                "access_token": access_token,
                "admin_id": admin.id,
                "role": "admin"
            }), 200
        
        return jsonify({"error": "Invalid credentials"}), 401
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================== CLUB LEADER ROUTES ========================

@app.route("/clubleaderregister", methods=["POST"])
@jwt_required()
def register_club_leader():
    try:
        data = request.get_json()
        
        if not all(key in data for key in ["user_id", "club_id", "position"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if user exists
        user = Users.query.get(data['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if club exists
        club = Clubs.query.get(data['club_id'])
        if not club:
            return jsonify({"error": "Club not found"}), 404
        
        # Check if user is already a leader for this club
        existing_leader = ClubLeaders.query.filter_by(user_id=data['user_id'], club_id=data['club_id'], is_current=True).first()
        if existing_leader:
            return jsonify({"error": "User is already a leader for this club"}), 400
        
        new_leader = ClubLeaders(
            user_id=data['user_id'],
            club_id=data['club_id'],
            position=data['position'],
            term_end=data.get('term_end')
        )
        db.session.add(new_leader)
        db.session.commit()
        return jsonify({"message": "Club leader registered successfully!", "leader_id": new_leader.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/clubleaderlogin", methods=["POST"])
def login_club_leader():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = Users.query.filter_by(email=data['email']).first()
        
        if not user or not bcrypt.check_password_hash(user.password, data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Check if user is a club leader
        leader = ClubLeaders.query.filter_by(user_id=user.id, is_current=True).first()
        if not leader:
            return jsonify({"error": "User is not a club leader"}), 403
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user_id": user.id,
            "role": "club_leader",
            "clubs": [l.club_id for l in ClubLeaders.query.filter_by(user_id=user.id, is_current=True).all()]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Add this temporary route to check club leaders
@app.route("/check-club-leader/<int:user_id>", methods=["GET"])
def check_club_leader(user_id):
    leader = ClubLeaders.query.filter_by(user_id=user_id, is_current=True).first()
    if leader:
        return jsonify({
            "is_leader": True,
            "club_id": leader.club_id,
            "position": leader.position
        })
    return jsonify({"is_leader": False})

# ======================== CLUB MANAGEMENT ROUTES ========================

@app.route("/clubs", methods=["GET"])
def get_clubs():
    try:
        clubs = Clubs.query.all()
        return jsonify([club.to_dict() for club in clubs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubs/<int:club_id>", methods=["GET"])
def get_club(club_id):
    try:
        club = Clubs.query.get(club_id)
        if not club:
            return jsonify({"error": "Club not found"}), 404
        return jsonify(club.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubs", methods=["POST"])
@jwt_required()
def add_club():
    try:
        # Check if user is admin
        current_user_id = int(get_jwt_identity())
        if not is_admin(current_user_id):
            return jsonify({"error": "Only admins can add clubs"}), 403
        
        data = request.get_json()
        
        if not all(key in data for key in ["name", "description"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        new_club = Clubs(
            name=data["name"],
            description=data["description"],
            meeting_day=data.get("meeting_day"),
            meeting_time=data.get("meeting_time"),
            meeting_location=data.get("meeting_location"),
            email=data.get("email"),
            faculty_advisor=data.get("faculty_advisor"),
            max_members=data.get("max_members", 100),
            created_by=current_user_id
        )
        
        db.session.add(new_club)
        db.session.commit()
        return jsonify({"message": "Club added successfully!", "club": new_club.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/clubs/<int:club_id>", methods=["PUT"])
@jwt_required()
def update_club(club_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        club = Clubs.query.get(club_id)
        if not club:
            return jsonify({"error": "Club not found"}), 404
        
        # Check if user is admin or club leader
        if not is_admin(current_user_id) and not check_club_leader_permission(current_user_id, club_id):
            return jsonify({"error": "Permission denied"}), 403
        
        data = request.get_json()
        for key in ["name", "description", "meeting_day", "meeting_time", "meeting_location", 
                   "email", "faculty_advisor", "max_members", "is_active"]:
            if key in data:
                setattr(club, key, data[key])
        
        db.session.commit()
        return jsonify({"message": "Club updated successfully!", "club": club.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/clubs/<int:club_id>", methods=["DELETE"])
@jwt_required()
def delete_club(club_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        if not is_admin(current_user_id):
            return jsonify({"error": "Only admins can delete clubs"}), 403
        
        club = Clubs.query.get(club_id)
        if not club:
            return jsonify({"error": "Club not found"}), 404
        
        db.session.delete(club)
        db.session.commit()
        return jsonify({"message": "Club deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ======================== CLUB APPLICATION ROUTES ========================

@app.route("/clubapplications", methods=["POST"])
@jwt_required()
def apply_to_club():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not all(key in data for key in ["club_id", "reason_for_joining"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if club exists
        club = Clubs.query.get(data["club_id"])
        if not club:
            return jsonify({"error": "Club not found"}), 404
        
        # Check if user is already a member
        existing_membership = Membership.query.filter_by(user_id=current_user_id, club_id=data["club_id"]).first()
        if existing_membership:
            return jsonify({"error": "You are already a member of this club"}), 400
        
        # Check if application already exists
        existing_application = ClubApplication.query.filter_by(user_id=current_user_id, club_id=data["club_id"], status='pending').first()
        if existing_application:
            return jsonify({"error": "You already have a pending application for this club"}), 400
        
        new_application = ClubApplication(
            user_id=current_user_id,
            club_id=data["club_id"],
            reason_for_joining=data["reason_for_joining"],
            skills=data.get("skills", "")
        )
        
        db.session.add(new_application)
        db.session.commit()
        return jsonify({"message": "Application submitted successfully!", "application": new_application.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/clubapplications", methods=["GET"])
@jwt_required()
def get_applications():
    try:
        current_user_id = int(get_jwt_identity())
        
        # If admin, get all applications
        if is_admin(current_user_id):
            applications = ClubApplication.query.all()
        else:
            # If club leader, get applications for their clubs
            leader_clubs = [l.club_id for l in ClubLeaders.query.filter_by(user_id=current_user_id, is_current=True).all()]
            if leader_clubs:
                applications = ClubApplication.query.filter(ClubApplication.club_id.in_(leader_clubs)).all()
            else:
                # Regular user, get their own applications
                applications = ClubApplication.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([app.to_dict() for app in applications]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubapplications/<int:application_id>/review", methods=["PUT"])
@jwt_required()
def review_application(application_id):
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not all(key in data for key in ["status", "review_notes"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        if data["status"] not in ["approved", "rejected"]:
            return jsonify({"error": "Invalid status. Must be 'approved' or 'rejected'"}), 400
        
        application = ClubApplication.query.get(application_id)
        if not application:
            return jsonify({"error": "Application not found"}), 404
        
        # Check if user is club leader for this club
        if not check_club_leader_permission(current_user_id, application.club_id) and not is_admin(current_user_id):
            return jsonify({"error": "Permission denied"}), 403
        
        # Update application
        application.status = data["status"]
        application.reviewed_by = current_user_id
        application.review_date = datetime.utcnow()
        application.review_notes = data["review_notes"]
        
        # If approved, create membership
        if data["status"] == "approved":
            membership = Membership(
                user_id=application.user_id,
                club_id=application.club_id,
                status='active'
            )
            db.session.add(membership)
        
        db.session.commit()
        return jsonify({"message": f"Application {data['status']} successfully!", "application": application.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/clubapplications/<int:application_id>", methods=["DELETE"])
@jwt_required()
def delete_application(application_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        application = ClubApplication.query.get(application_id)
        if not application:
            return jsonify({"error": "Application not found"}), 404
        
        # Only the applicant or admin can delete
        if application.user_id != current_user_id and not is_admin(current_user_id):
            return jsonify({"error": "Permission denied"}), 403
        
        db.session.delete(application)
        db.session.commit()
        return jsonify({"message": "Application deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ======================== MEMBERSHIP ROUTES ========================

@app.route("/memberships", methods=["GET"])
@jwt_required()
def get_memberships():
    try:
        current_user_id = int(get_jwt_identity())
        
        # If admin, get all memberships
        if is_admin(current_user_id):
            memberships = Membership.query.all()
        else:
            # Get memberships for the current user or their clubs if club leader
            leader_clubs = [l.club_id for l in ClubLeaders.query.filter_by(user_id=current_user_id, is_current=True).all()]
            if leader_clubs:
                memberships = Membership.query.filter(
                    (Membership.user_id == current_user_id) | 
                    (Membership.club_id.in_(leader_clubs))
                ).all()
            else:
                memberships = Membership.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([m.to_dict() for m in memberships]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/memberships/<int:membership_id>", methods=["DELETE"])
@jwt_required()
def leave_club(membership_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        membership = Membership.query.get(membership_id)
        if not membership:
            return jsonify({"error": "Membership not found"}), 404
        
        # User can only remove their own membership unless they're admin
        if membership.user_id != current_user_id and not is_admin(current_user_id):
            return jsonify({"error": "Permission denied"}), 403
        
        db.session.delete(membership)
        db.session.commit()
        return jsonify({"message": "Successfully left the club"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ======================== ANNOUNCEMENT ROUTES ========================

@app.route("/announcements", methods=["POST"])
@jwt_required()
def create_announcement():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not all(key in data for key in ["title", "content"]):
            return jsonify({"error": "Missing required fields"}), 400
        
        club_id = data.get("club_id")
        is_global = data.get("is_global", False)
        
        # If it's a global announcement, only admins can post
        if is_global:
            if not is_admin(current_user_id):
                return jsonify({"error": "Only admins can post global announcements"}), 403
        else:
            # Club-specific announcement
            if not club_id:
                return jsonify({"error": "club_id is required for club announcements"}), 400
            
            club = Clubs.query.get(club_id)
            if not club:
                return jsonify({"error": "Club not found"}), 404
            
            # Check if user is club leader or admin
            if not check_club_leader_permission(current_user_id, club_id) and not is_admin(current_user_id):
                return jsonify({"error": "Only club leaders can post announcements"}), 403
        
        announcement = Announcement(
            club_id=club_id,
            title=data["title"],
            content=data["content"],
            posted_by=current_user_id,
            is_global=is_global,
            is_pinned=data.get("is_pinned", False)
        )
        
        db.session.add(announcement)
        db.session.commit()
        return jsonify({"message": "Announcement created successfully!", "announcement": announcement.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/announcements", methods=["GET"])
def get_announcements():
    try:
        # Get both global announcements and club-specific ones
        announcements = Announcement.query.filter(
            (Announcement.is_global == True) | 
            (Announcement.club_id.isnot(None))
        ).order_by(Announcement.is_pinned.desc(), Announcement.posted_date.desc()).all()
        
        return jsonify([a.to_dict() for a in announcements]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/announcements/club/<int:club_id>", methods=["GET"])
def get_club_announcements(club_id):
    try:
        announcements = Announcement.query.filter_by(club_id=club_id).order_by(
            Announcement.is_pinned.desc(), 
            Announcement.posted_date.desc()
        ).all()
        return jsonify([a.to_dict() for a in announcements]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/announcements/<int:announcement_id>", methods=["DELETE"])
@jwt_required()
def delete_announcement(announcement_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        announcement = Announcement.query.get(announcement_id)
        if not announcement:
            return jsonify({"error": "Announcement not found"}), 404
        
        # Check permissions
        if announcement.posted_by != current_user_id and not is_admin(current_user_id):
            return jsonify({"error": "Permission denied"}), 403
        
        db.session.delete(announcement)
        db.session.commit()
        return jsonify({"message": "Announcement deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ======================== USER DASHBOARD ROUTE ========================

@app.route("/dashboard", methods=["GET"])
@jwt_required()
def get_user_dashboard():
    try:
        current_user_id = int(get_jwt_identity())
        
        user = Users.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get user's memberships
        memberships = Membership.query.filter_by(user_id=current_user_id, status='active').all()
        
        # Get user's pending applications
        pending_applications = ClubApplication.query.filter_by(user_id=current_user_id, status='pending').all()
        
        # If user is a club leader, get their clubs
        leader_clubs = ClubLeaders.query.filter_by(user_id=current_user_id, is_current=True).all()
        
        return jsonify({
            "user": user.to_dict(),
            "active_memberships": [m.to_dict() for m in memberships],
            "pending_applications": [a.to_dict() for a in pending_applications],
            "club_leader_for": [l.to_dict() for l in leader_clubs]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================== STATISTICS ROUT
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)