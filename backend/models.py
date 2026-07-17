from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

db     = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True)
    username     = db.Column(db.String(80), unique=True, nullable=False)
    password     = db.Column(db.String(200), nullable=False)
    role         = db.Column(db.String(20), nullable=False)  # admin or analyst
    name         = db.Column(db.String(100), nullable=False)
    is_active    = db.Column(db.Boolean, default=True)
    created_by   = db.Column(db.String(80), nullable=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to password requests
    password_requests = db.relationship(
        'PasswordRequest',
        backref='analyst',
        lazy=True
    )

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(
            password
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id':         self.id,
            'username':   self.username,
            'role':       self.role,
            'name':       self.name,
            'is_active':  self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() + 'Z'
        }


class PasswordRequest(db.Model):
    __tablename__ = 'password_requests'

    id              = db.Column(db.Integer, primary_key=True)
    analyst_id      = db.Column(
                        db.Integer,
                        db.ForeignKey('users.id'),
                        nullable=False
                      )
    new_password    = db.Column(db.String(200), nullable=False)
    status          = db.Column(
                        db.String(20),
                        default='pending'
                      )  # pending, approved, rejected
    reason          = db.Column(db.String(500), nullable=True)
    requested_at    = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at     = db.Column(db.DateTime, nullable=True)
    resolved_by     = db.Column(db.String(80), nullable=True)
    reject_reason   = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id':            self.id,
            'analyst_id':    self.analyst_id,
            'analyst_name':  self.analyst.name,
            'analyst_username': self.analyst.username,
            'status':        self.status,
            'reason':        self.reason,
            'requested_at':  self.requested_at.isoformat() + 'Z',
            'resolved_at':   self.resolved_at.isoformat() + 'Z'
                             if self.resolved_at else None,
            'resolved_by':   self.resolved_by,
            'reject_reason': self.reject_reason,
        }
class Investigation(db.Model):
    __tablename__ = 'investigations'

    id                   = db.Column(db.Integer, primary_key=True)
    transaction_id       = db.Column(db.String(100), nullable=False)
    flagged_by           = db.Column(db.String(80), nullable=False)
    reason               = db.Column(db.String(500), nullable=False)
    original_prediction  = db.Column(db.String(20), default='LEGITIMATE')
    status               = db.Column(db.String(20), default='under_review')
    created_at           = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':                  self.id,
            'transaction_id':      self.transaction_id,
            'flagged_by':          self.flagged_by,
            'reason':              self.reason,
            'original_prediction': self.original_prediction,
            'status':              self.status,
            'created_at':          self.created_at.isoformat() + 'Z'
        }