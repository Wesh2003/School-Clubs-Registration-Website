from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime
from models import db, Users, Clubs, Admins, ClubLeaders, Membership, ClubApplication

app = Flask(__name__)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///club_registration_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Change this in production

# Initialize Extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow React frontend
CORS(app, supports_credentials=True)


@app.route("/")
def home():
    return jsonify({"message": "Welcome to the API!"}), 200

# 🟢 User Registration
@app.route("/userregister", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ["first_name", "last_name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_user = Users(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🟢 User Login
@app.route("/userlogin", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        user = Users.query.filter_by(email=data['email']).first()

        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({"access_token": access_token, "user_id": user.id}), 200
        
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/users", methods=["GET"])
def fetch_all_users():
    try:
        users = Users.query.all()
        users_list = [{
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "password": user.password
        } for user in users]

        return jsonify(users_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Ensure the logged-in user can only access their own profile
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        user = Users.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
            # "phone": user.phone if hasattr(user, "phone") else None  # Ensure 'phone' exists
        }
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user_from_users_list(user_id):
    try:
        # Find user by ID
        user = Users.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Delete user and commit changes
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




















# 🟢 List all available job services
@app.route("/clubs", methods=["GET"])
def get_jobs():
    try:
        clubs = Clubs.query.all()
        clubs_list = [{
            "id": club.id,
            "name": club.name,
            "description": club.description,
            "meeting_day": club.meeting_day,
            "meeting_time": club.meeting_time,
            "meeting_location": club.meeting_location,
            "email": club.email,
            "faculty_advisor": club.faculty_advisor,
            "max_members": club.max_members,
            "is_active": club.is_active,
            "date_added": club.date_added.strftime('%Y-%m-%d %H:%M:%S')
        } for club in clubs]

        return jsonify(clubs_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubs", methods=["POST"])
def add_club():
    try:
        data = request.get_json()  # Get JSON data from frontend

        # Validate required fields
        if not all(key in data for key in ["name", "description", "meeting_day", "meeting_time", "meeting_location"]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new club entry
        new_club = Clubs(
            name=data["name"],
            description=data["description"],
            meeting_day=data["meeting_day"],
            meeting_time=data["meeting_time"],
            meeting_location=data["meeting_location"]
        )

        # Add and commit to database
        db.session.add(new_club)
        db.session.commit()

        return jsonify({
            "id": new_club.id,
            "name": new_club.name,
            "description": new_club.description,
            "meeting_day": new_club.meeting_day,
            "meeting_time": new_club.meeting_time,
            "meeting_location": new_club.meeting_location
        }), 201  # 201 Created status

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500

@app.route("/clubs/<int:club_id>", methods=["DELETE"])
@jwt_required()
def delete_club_from_clubs_list(club_id):
    try:
        # Find club by ID
        club = Clubs.query.get(club_id)
        if not club:
            return jsonify({"error": "Club not found"}), 404

        # Delete club and commit changes
        db.session.delete(club)
        db.session.commit()

        return jsonify({"message": "Club deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500








# 🟢 Get Available Groomers
@app.route("/clubleaderregister", methods=["POST"])
def club_leader_register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ["first_name", "last_name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_club_leader = ClubLeaders(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_club_leader)
        db.session.commit()
        return jsonify({"message": "Club leader registered successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🟢 Club Leader Login
@app.route("/clubleaderlogin", methods=["POST"])
def club_leader_login():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        club_leader = ClubLeaders.query.filter_by(email=data['email']).first()

        if club_leader and bcrypt.check_password_hash(club_leader.password, data['password']):
            club_leader_access_token = create_access_token(identity=str(club_leader.id))
            return jsonify({"club_leader_access_token": club_leader_access_token, "club_leader_id": club_leader.id}), 200
        
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubleaderrefresh", methods=["POST"])
@jwt_required(refresh=True)  # Requires a refresh token
def club_leader_refresh_token():
    current_club_leader = get_jwt_identity()
    new_club_leader_token = create_access_token(identity=str(current_club_leader))
    return jsonify(club_leader_access_token=new_club_leader_token), 200

@app.route("/clubleaders", methods=["GET"])
def get_club_leaders():
    try:
        club_leaders = ClubLeaders.query.all()
        return jsonify([{
            "id": club_leader.id,
            "first_name": club_leader.first_name,
            "last_name": club_leader.last_name,
            "email": club_leader.email
        } for club_leader in club_leaders]), 200  # ✅ Fix: Return array directly

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/clubleaders/<int:club_leader_id>", methods=["GET"])
@jwt_required()
def get_club_leader(club_leader_id):
    try:
        current_club_leader_id = get_jwt_identity()
        
        # Ensure the logged-in club leader can only access their own profile
        if current_club_leader_id != club_leader_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        club_leader = ClubLeaders.query.get(club_leader_id)
        
        if not club_leader:
            return jsonify({"error": "Club leader not found"}), 404

        club_leader_data = {
            "id": club_leader.id,
            "first_name": club_leader.first_name,
            "last_name": club_leader.last_name,
            "email": club_leader.email
        }
        return jsonify(club_leader_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clubleaders/<int:club_leader_id>", methods=["DELETE"])
@jwt_required()
def delete_club_leader(club_leader_id):
    try:
        # Find club leader by ID
        club_leader = ClubLeaders.query.get(club_leader_id)
        if not club_leader:
            return jsonify({"error": "Club leader not found"}), 404

        # Delete club leader and commit changes
        db.session.delete(club_leader)
        db.session.commit()

        return jsonify({"message": "Club leader deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500








@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)  # Requires a refresh token
def refresh_token():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=str(current_user))
    return jsonify(access_token=new_token), 200







@app.route("/adminregister", methods=["POST"])
def admin_register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ["first_name", "last_name", "email", "password"]):
            return jsonify({"error": "Missing required fields"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        new_admin = Admins(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=hashed_password
        )
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({"message": "Admin registered successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🟢 Admin Login
@app.route("/adminlogin", methods=["POST"])
def admin_login():
    try:
        data = request.get_json()
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        admin = Admins.query.filter_by(email=data['email']).first()

        if admin and bcrypt.check_password_hash(admin.password, data['password']):
            admin_access_token = create_access_token(identity=str(admin.id))
            return jsonify({"admin_access_token": admin_access_token, "admin_id": admin.id}), 200
        
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/adminrefresh", methods=["POST"])
@jwt_required(refresh=True)  # Requires a refresh token
def admin_refresh_token():
    current_admin = get_jwt_identity()
    new_admin_token = create_access_token(identity=str(current_admin))
    return jsonify(admin_access_token=new_admin_token), 200











@app.route("/clubapplications", methods=["POST"])
def add_club_application_to_collective():
    try:
        data = request.get_json()  # Get JSON data from frontend

        # Validate required fields
        if not all(key in data for key in ["user_id", "club_id", "reason_for_joining"]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new club application entry
        new_club_application = ClubApplication(
            user_id=data["user_id"],
            club_id=data["club_id"],
            reason_for_joining=data["reason_for_joining"],
            skills=data.get("skills", ""),  # Optional field
            status=data.get("status", "pending")  # Default to pending
        )

        # Add and commit to database
        db.session.add(new_club_application)
        db.session.commit()

        return jsonify({
            "id": new_club_application.id,
            "user_id": new_club_application.user_id,
            "club_id": new_club_application.club_id,
            "application_date": new_club_application.application_date.isoformat(),
            "status": new_club_application.status,
            "reason_for_joining": new_club_application.reason_for_joining,
            "skills": new_club_application.skills
        }), 201  # 201 Created status

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500


# Route to get all club applications
@app.route("/clubapplications", methods=["GET"])
def get_club_applications():
    try:
        applications = ClubApplication.query.all()
        result = []
        for app in applications:
            result.append({
                "id": app.id,
                "user_id": app.user_id,
                "club_id": app.club_id,
                "application_date": app.application_date.isoformat() if app.application_date else None,
                "status": app.status,
                "reason_for_joining": app.reason_for_joining,
                "skills": app.skills,
                "reviewed_by": app.reviewed_by,
                "review_date": app.review_date.isoformat() if app.review_date else None,
                "review_notes": app.review_notes
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to create a new club application


@app.route('/userpurchasedtask/<int:task_id>/mark-taken', methods=['PATCH'])
def mark_task_as_taken(task_id):
    task = UserPurchasedTasks.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    task.taken = True
    db.session.commit()
    return jsonify({"message": "Task marked as taken"})


























if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)