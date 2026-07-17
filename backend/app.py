from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import datetime
import traceback
from blockchainlogger import (log_fraud_to_blockchain, 
                                get_fraud_record,
                                get_total_records,
                                get_blockchain_status)
load_dotenv()

# Import ML predictor
from predictor import predict_transaction, get_model_info
from flask_jwt_extended import JWTManager
from models import db, bcrypt, User, Investigation
from auth_routes import auth_bp
import os
import numpy as np

# Create Flask app
app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///fraudshield.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY']                 = os.getenv(
    'JWT_SECRET_KEY', 'fraudshield-secret-key-2026'
)
# app.config['JWT_ACCESS_TOKEN_EXPIRES']       = False

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
    }
})

# Register auth blueprint
app.register_blueprint(auth_bp)

# In-memory transaction log
# Stores recent predictions for the dashboard
transaction_log = []

# ROUTE 1 — Health Check

@app.route('/api/health', methods=['GET'])
def health_check():
    """    Simple endpoint to confirm the API is running.
    React dashboard calls this on startup to verify
    the backend is reachable. """
    return jsonify({
        "status": "online",
        "message": "Fraud Detection API is running",
        "timestamp": datetime.datetime.now().isoformat(),
        "model": get_model_info()["model_name"]
    })

# ROUTE 2 — Single Transaction Prediction

@app.route('/api/predict', methods=['POST'])
def predict():
    """  Main prediction endpoint.
    Receives a transaction as JSON, runs it through
    XGBoost, generates SHAP explanation, returns result.
    
    Expected input format:
    {
        "transaction_id": "TXN001",
        "V1": -1.359807,
        "V2": -0.072781,
    } """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400
        
        # Extract transaction ID if provided
        transaction_id = data.pop('transaction_id', 
                                   f"TXN_{len(transaction_log)+1:06d}")
        
        # Run prediction
        result = predict_transaction(data)
        
        if "error" in result:
            return jsonify(result), 400
        
        # Add transaction metadata
        result["transaction_id"] = transaction_id
        result["timestamp"] = datetime.datetime.now().isoformat()
        
        # Build blockchain log entry if fraud detected
        if result["should_log_to_blockchain"]:
            blockchain_log = {
                "transaction_id": transaction_id,
                "timestamp": result["timestamp"],
                "prediction": result["prediction_label"],
                "confidence": result["confidence"],
                "top_3_features": result["top_features"][:3],
                "model_version": "xgboost_v1.0"
            }
            result["blockchain_log"] = blockchain_log
            
            # Actually log to blockchain
            blockchain_result = log_fraud_to_blockchain(blockchain_log)
            result["blockchain_result"] = blockchain_result
        
        # Store in transaction log for dashboard
        log_entry = {
            "transaction_id": transaction_id,
            "timestamp": result["timestamp"],
            "prediction": result["prediction_label"],
            "confidence": result["confidence"],
            "fraud_probability": result["fraud_probability"],
            "response_time_ms": result["response_time_ms"],
            "logged_to_blockchain": result["should_log_to_blockchain"],
            "top_features": result.get("top_features",[]),
            "blockchain_result":result.get("blockchain_result")
        }
        transaction_log.append(log_entry)
        
        # Keep only last 100 transactions in memory
        if len(transaction_log) > 100:
            transaction_log.pop(0)
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


# ROUTE 3 — Batch Prediction

@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """  Predict multiple transactions at once.
    Useful for testing and demonstration purposes.

    Expected input:
    {
        "transactions": [
            {"transaction_id": "TXN001", "V1": ..., ...},
            {"transaction_id": "TXN002", "V1": ..., ...}
        ]
    }  """
    try:
        data = request.get_json()
        
        if not data or "transactions" not in data:
            return jsonify({
                "error": "Expected format: {'transactions': [...]}"
            }), 400
        
        transactions = data["transactions"]
        results = []
        fraud_count = 0
        
        for txn in transactions:
            transaction_id = txn.pop('transaction_id',
                                      f"TXN_{len(transaction_log)+1:06d}")
            result = predict_transaction(txn)
            result["transaction_id"] = transaction_id
            result["timestamp"] = datetime.datetime.now().isoformat()
            
            if result.get("prediction") == 1:
                fraud_count += 1
            
            results.append(result)
        
        return jsonify({
            "total_transactions": len(transactions),
            "fraud_detected": fraud_count,
            "legitimate": len(transactions) - fraud_count,
            "fraud_rate": round(fraud_count/len(transactions)*100, 2),
            "results": results
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# ROUTE 4 — Transaction History

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """
    Returns recent transaction history for the dashboard.
    React dashboard polls this to show the live feed.
    """
    limit = request.args.get('limit', 20, type=int)
    filter_type = request.args.get('filter', 'all')
    
    filtered = transaction_log.copy()
    
    if filter_type == 'fraud':
        filtered = [t for t in filtered 
                   if t['prediction'] == 'FRAUD']
    elif filter_type == 'legitimate':
        filtered = [t for t in filtered 
                   if t['prediction'] == 'LEGITIMATE']
    
    # Return most recent first
    filtered = list(reversed(filtered))[:limit]
    
    return jsonify({
        "total": len(transaction_log),
        "fraud_total": sum(1 for t in transaction_log 
                          if t['prediction'] == 'FRAUD'),
        "transactions": filtered
    })

# ROUTE 5 — Model Information

@app.route('/api/model', methods=['GET'])
def model_info():
    """
    Returns model metadata and performance metrics.
    Dashboard displays this in the model info panel.
    """
    # Load saved metrics from Sprint 2
    results_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'data', 'results', 'model_results.json'
    )
    
    metrics = {}
    if os.path.exists(results_path):
        with open(results_path, 'r') as f:
            metrics = json.load(f)
    
    return jsonify({
        "model_info": get_model_info(),
        "performance_metrics": metrics
    })

# ROUTE 6 — Blockchain status

@app.route('/api/blockchain/status', methods=['GET'])
def blockchain_status():
    """Returns blockchain connection and statistics."""
    return jsonify(get_blockchain_status())


# ROUTE 7 — Get fraud record from blockchain

@app.route('/api/blockchain/record/<int:record_id>', methods=['GET'])
def get_blockchain_record(record_id):
    """Retrieves a specific fraud record from blockchain."""
    record = get_fraud_record(record_id)
    if "error" in record:
        return jsonify(record), 404
    return jsonify(record)


# ROUTE 8 — Get random transaction from test set

@app.route('/api/demo/random-transaction', methods=['GET'])
def random_transaction():
    """
    Returns a random real transaction from the test set.
    Query param: type = 'fraud' or 'legitimate' or 'random'
    
    This is how the demo panel gets real data instead
    of hardcoded values — guarantees authentic predictions.
    """

    try:
        txn_type = request.args.get('type', 'random')

        # Load test set
        base_dir = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
        X_test = np.load(
            os.path.join(base_dir, 'data', 'processed', 'X_test.npy')
        )
        y_test = np.load(
            os.path.join(base_dir, 'data', 'processed', 'y_test.npy')
        )

        # Load feature names
        import joblib
        feature_names = joblib.load(
            os.path.join(base_dir, 'ml', 'feature_names.pkl')
        )

        # Filter by type
        if txn_type == 'fraud':
            indices = np.where(y_test == 1)[0]
        elif txn_type == 'legitimate':
            indices = np.where(y_test == 0)[0]
        else:
            indices = np.arange(len(y_test))

        # Pick random transaction
        idx = np.random.choice(indices)
        txn = X_test[idx]
        actual_label = int(y_test[idx])

        # Build transaction dict
        txn_dict = {
            feature: float(txn[i])
            for i, feature in enumerate(feature_names)
        }

        return jsonify({
            "transaction_data": txn_dict,
            "actual_label": actual_label,
            "actual_label_text": "FRAUD" if actual_label == 1 else "LEGITIMATE",
            "index": int(idx),
            "note": "Real transaction from test set"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ROUTE 9 — Update transaction investigation status

@app.route('/api/transactions/<transaction_id>/status', 
           methods=['PUT'])
def update_transaction_status(transaction_id):
    """
    Analyst updates the investigation status of a transaction.
    Status options: under_review, confirmed_fraud, false_positive
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    status = data.get('status')
    notes  = data.get('notes', '')

    valid_statuses = [
        'under_review',
        'confirmed_fraud', 
        'false_positive',
        'suspicious'
    ]

    if status not in valid_statuses:
        return jsonify({
            "error": f"Status must be one of {valid_statuses}"
        }), 400

    # Find transaction in log and update it
    for txn in transaction_log:
        if txn['transaction_id'] == transaction_id:
            txn['investigation_status'] = status
            txn['investigation_notes']  = notes
            txn['investigated_at']      = \
                datetime.datetime.now().isoformat()
            return jsonify({
                "message":    "Status updated successfully",
                "transaction_id": transaction_id,
                "status":     status,
                "notes":      notes,
            }), 200

    return jsonify({"error": "Transaction not found"}), 404


# ROUTE 10 — Get investigation summary for analyst

@app.route('/api/transactions/investigation-summary', methods=['GET'])
def investigation_summary():
    """
    Returns summary of analyst investigation activity
    for the current session.
    """
    # All transactions flagged by model as fraud
    fraud_txns = [t for t in transaction_log if t['prediction'] == 'FRAUD']

    # All transactions analyst has reviewed (any prediction type)
    all_reviewed = [t for t in transaction_log if t.get('investigation_status')]

    confirmed    = sum(1 for t in all_reviewed if t.get('investigation_status') == 'confirmed_fraud')
    false_pos    = sum(1 for t in all_reviewed if t.get('investigation_status') == 'false_positive')
    under_review = sum(1 for t in all_reviewed if t.get('investigation_status') == 'under_review')
    suspicious   = sum(1 for t in all_reviewed if t.get('investigation_status') == 'suspicious')

    # False negatives = LEGITIMATE predictions analyst marked as confirmed_fraud or suspicious
    false_negatives = sum(
        1 for t in transaction_log
        if t['prediction'] == 'LEGITIMATE'
        and t.get('investigation_status') in ('confirmed_fraud', 'suspicious')
    )

    # Unreviewed = fraud transactions analyst hasn't touched yet
    unreviewed = sum(1 for t in fraud_txns if not t.get('investigation_status'))

    return jsonify({
        "total_fraud":     len(fraud_txns),
        "confirmed":       confirmed,
        "false_positive":  false_pos,
        "under_review":    under_review,
        "unreviewed":      unreviewed,
        "false_negatives": false_negatives,
        "suspicious":      suspicious,
    }), 200
# ROUTE 11 — Flag legitimate transaction as suspicious (persists to DB)
@app.route('/api/investigations', methods=['POST'])
def flag_investigation():
    data = request.get_json()

    if not data.get('transaction_id') or not data.get('reason'):
        return jsonify({'error': 'transaction_id and reason required'}), 400

    existing = Investigation.query.filter_by(
        transaction_id=data['transaction_id']
    ).first()
    if existing:
        return jsonify({'error': 'Transaction already flagged'}), 409

    investigation = Investigation(
        transaction_id      = data['transaction_id'],
        flagged_by          = data.get('flagged_by', 'analyst'),
        reason              = data['reason'],
        original_prediction = 'LEGITIMATE'
    )
    db.session.add(investigation)
    db.session.commit()

    return jsonify({
        'message':          'Transaction flagged for investigation',
        'investigation_id': investigation.id,
        'flagged_by':       investigation.flagged_by,
        'created_at':       investigation.created_at.isoformat()
    }), 201

# route 12 gets all saved flags 
@app.route('/api/investigations', methods=['GET'])
def get_investigations():
    investigations = Investigation.query.order_by(
        Investigation.created_at.desc()
    ).all()
    return jsonify({
        'total':          len(investigations),
        'investigations': [i.to_dict() for i in investigations]
    }), 200
# Run the app

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()

        # Create default admin account if none exists
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin = User(
                username   = 'admin',
                name       = 'System Administrator',
                role       = 'admin',
                created_by = 'system',
                is_active  = True
            )
            admin.set_password('Admin@2026')
            db.session.add(admin)
            db.session.commit()
            print("Default admin created:")
            print("  Username: admin")
            print("  Password: Admin@2026")
            print("  Change this password after first login!")

    port  = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'

    print(f"  URL:   http://localhost:{port}")
    print(f"  Debug: {debug}")
    print("\nAvailable endpoints:")
    # print("  GET  /api/health")
    # print("  POST /api/auth/login")
    # print("  GET  /api/auth/me")
    # print("  POST /api/auth/create-analyst")
    # print("  GET  /api/auth/users")
    # print("  PUT  /api/auth/users/<id>/toggle")
    # print("  PUT  /api/auth/users/<id>/reset-password")
    # print("  POST /api/auth/password-request")
    # print("  GET  /api/auth/password-requests")
    # print("  PUT  /api/auth/password-requests/<id>/resolve")
    # print("  GET  /api/auth/my-request")
    # print("  POST /api/predict")
    # print("  POST /api/predict/batch")
    # print("  GET  /api/transactions")
    # print("  GET  /api/model")
    # print("  GET  /api/blockchain/status")
    # print("  GET  /api/blockchain/record/<id>")
    # print("  GET  /api/demo/random-transaction")
    # print("  PUT  /api/transactions/<id>/status")
    # print("  GET  /api/transactions/investigation-summary")

    app.run(host='0.0.0.0', port=port, debug=debug)