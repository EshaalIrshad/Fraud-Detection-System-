from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from models import db, User, PasswordRequest
from datetime import datetime, timedelta
import json

auth_bp = Blueprint('auth', __name__)

# ROUTE — Login
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    Login endpoint for both admin and analyst.
    Returns JWT token on success.
    React stores this token and sends it with every request.
    """
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({
            "error": "Username and password required"
        }), 400

    user = User.query.filter_by(
        username=data['username'].lower()
    ).first()

    if not user:
        return jsonify({"error": "Username not found"}), 401

    if not user.is_active:
        return jsonify({
            "error": "Account deactivated — contact admin"
        }), 401

    if not user.check_password(data['password']):
        return jsonify({"error": "Incorrect password"}), 401

    # Create JWT token
    # Token contains user identity and role
    # Expires in 8 hours — one work day
    additional_claims = {
        "role":     user.role,
        "name":     user.name,
        "username": user.username,
    }

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


# ROUTE — Get current user
@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Returns current logged in user details."""
    user_id = get_jwt_identity()
    user    = User.query.get(int(user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


# ROUTE — Create analyst (Admin only)
@auth_bp.route('/api/auth/create-analyst', methods=['POST'])
@jwt_required()
def create_analyst():
    """
    Creates a new analyst account.
    Only admin can call this endpoint.
    """
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({
            "error": "Only admin can create analyst accounts"
        }), 403

    data = request.get_json()

    required = ['username', 'password', 'name']
    for field in required:
        if not data.get(field):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    # Check username not already taken
    existing = User.query.filter_by(
        username=data['username'].lower()
    ).first()

    if existing:
        return jsonify({
            "error": "Username already exists"
        }), 409

    # Create the analyst
    new_analyst = User(
        username   = data['username'].lower(),
        name       = data['name'],
        role       = 'analyst',
        created_by = claims.get('username'),
        is_active  = True
    )
    new_analyst.set_password(data['password'])

    db.session.add(new_analyst)
    db.session.commit()

    return jsonify({
        "message":  "Analyst account created successfully",
        "analyst":  new_analyst.to_dict()
    }), 201


# ROUTE — Get all users (Admin only)
@auth_bp.route('/api/auth/users', methods=['GET'])
@jwt_required()
def get_users():
    """Returns all analyst accounts. Admin only."""
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({
            "error": "Admin access required"
        }), 403

    users = User.query.filter_by(role='analyst').all()

    return jsonify({
        "users": [u.to_dict() for u in users]
    }), 200


# ROUTE — Toggle user active status (Admin only)
@auth_bp.route('/api/auth/users/<int:user_id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_user(user_id):
    """Activate or deactivate an analyst account. Admin only."""
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == 'admin':
        return jsonify({
            "error": "Cannot deactivate admin account"
        }), 400

    user.is_active = not user.is_active
    db.session.commit()

    return jsonify({
        "message":   f"Account {'activated' if user.is_active else 'deactivated'}",
        "is_active": user.is_active
    }), 200


# ROUTE — Admin resets analyst password directly
@auth_bp.route('/api/auth/users/<int:user_id>/reset-password',
               methods=['PUT'])
@jwt_required()
def admin_reset_password(user_id):
    """Admin directly resets an analyst password."""
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()

    if not data.get('new_password'):
        return jsonify({"error": "New password required"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == 'admin':
        return jsonify({
            "error": "Cannot reset admin password this way"
        }), 400

    user.set_password(data['new_password'])
    db.session.commit()

    return jsonify({
        "message": "Password reset successfully"
    }), 200

# ROUTE — Analyst submits password change request
@auth_bp.route('/api/auth/password-request', methods=['POST'])
@jwt_required()
def submit_password_request():
    """
    Analyst submits a request to change their password.
    Admin must approve before password changes.
    """
    claims  = get_jwt()
    user_id = get_jwt_identity()

    if claims.get('role') != 'analyst':
        return jsonify({
            "error": "Only analysts can submit password requests"
        }), 403

    data = request.get_json()

    if not data.get('new_password'):
        return jsonify({"error": "New password required"}), 400

    # Check if analyst already has a pending request
    existing = PasswordRequest.query.filter_by(
        analyst_id = int(user_id),
        status     = 'pending'
    ).first()

    if existing:
        return jsonify({
            "error": "You already have a pending request — wait for admin to review"
        }), 409

    # Hash the new password before storing
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt()
    hashed = bcrypt.generate_password_hash(
        data['new_password']
    ).decode('utf-8')

    new_request = PasswordRequest(
        analyst_id   = int(user_id),
        new_password = hashed,
        reason       = data.get('reason', ''),
        status       = 'pending'
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "message": "Password change request submitted — awaiting admin approval",
        "request": new_request.to_dict()
    }), 201


# ROUTE — Get password requests (Admin only)
@auth_bp.route('/api/auth/password-requests', methods=['GET'])
@jwt_required()
def get_password_requests():
    """Returns all pending password requests. Admin only."""
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    status   = request.args.get('status', 'pending')
    requests = PasswordRequest.query.filter_by(
        status=status
    ).order_by(
        PasswordRequest.requested_at.desc()
    ).all()

    return jsonify({
        "requests": [r.to_dict() for r in requests],
        "count":    len(requests)
    }), 200


# ROUTE — Approve or reject password request (Admin only)
@auth_bp.route('/api/auth/password-requests/<int:request_id>/resolve',
               methods=['PUT'])
@jwt_required()
def resolve_password_request(request_id):
    """
    Admin approves or rejects a password change request.
    If approved the analyst password is immediately updated.
    """
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()

    if not data.get('action') in ['approve', 'reject']:
        return jsonify({
            "error": "Action must be approve or reject"
        }), 400

    pwd_request = PasswordRequest.query.get(request_id)

    if not pwd_request:
        return jsonify({"error": "Request not found"}), 404

    if pwd_request.status != 'pending':
        return jsonify({
            "error": "Request already resolved"
        }), 409

    if data['action'] == 'approve':
        # Update the analyst password
        analyst = User.query.get(pwd_request.analyst_id)
        analyst.password = pwd_request.new_password
        pwd_request.status = 'approved'

    else:
        pwd_request.status      = 'rejected'
        pwd_request.reject_reason = data.get('reject_reason', '')

    pwd_request.resolved_at = datetime.utcnow()
    pwd_request.resolved_by = claims.get('username')

    db.session.commit()

    return jsonify({
        "message": f"Request {data['action']}d successfully",
        "status":  pwd_request.status
    }), 200


# ROUTE — Analyst checks their request status
@auth_bp.route('/api/auth/my-request', methods=['GET'])
@jwt_required()
def get_my_request():
    """Analyst checks status of their password change request."""
    user_id = get_jwt_identity()

    latest_request = PasswordRequest.query.filter_by(
        analyst_id=int(user_id)
    ).order_by(
        PasswordRequest.requested_at.desc()
    ).first()

    if not latest_request:
        return jsonify({"request": None}), 200

    return jsonify({
        "request": latest_request.to_dict()
    }), 200