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
# Load environment variables from .env file
load_dotenv()

# Import our ML predictor
from predictor import predict_transaction, get_model_info

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# In-memory transaction log
# Stores recent predictions for the dashboard
# In production this would be a database
transaction_log = []

# ROUTE 1 — Health Check

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Simple endpoint to confirm the API is running.
    React dashboard calls this on startup to verify
    the backend is reachable.
    """
    return jsonify({
        "status": "online",
        "message": "Fraud Detection API is running",
        "timestamp": datetime.datetime.now().isoformat(),
        "model": get_model_info()["model_name"]
    })

# ROUTE 2 — Single Transaction Prediction

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    
    Receives a transaction as JSON, runs it through
    XGBoost, generates SHAP explanation, returns result.
    
    
    Expected input format:
    {
        "transaction_id": "TXN001",
        "V1": -1.359807,
        "V2": -0.072781,
        ... (V1 through V28)
        "Amount_scaled": 0.244964,
        "Time_scaled": -0.994983
    }
    """
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
            "logged_to_blockchain": result["should_log_to_blockchain"]
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
    """
    Predict multiple transactions at once.
    Useful for testing and demonstration purposes.
    
    Expected input:
    {
        "transactions": [
            {"transaction_id": "TXN001", "V1": ..., ...},
            {"transaction_id": "TXN002", "V1": ..., ...}
        ]
    }
    """
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

# ROUTE 6 — Test with real fraud sample

@app.route('/api/test/fraud-sample', methods=['GET'])
def test_fraud_sample():
    """
    Tests the API with a known fraud transaction
    from the dataset. Useful for verifying everything works.
    This endpoint is for development/testing only.
    """
    # This is a real fraud transaction from the dataset
    fraud_sample = {
        "V1": -1.3598071, "V2": -0.0727812, "V3": 2.5363467,
        "V4": 1.3781553,  "V5": -0.338321,  "V6": 0.4623878,
        "V7": 0.2395986,  "V8": 0.0986980,  "V9": 0.3637870,
        "V10": 0.0907942, "V11": -0.5515995, "V12": -0.6178009,
        "V13": -0.9913898, "V14": -0.3111694, "V15": 1.4681770,
        "V16": -0.4704005, "V17": 0.2079708,  "V18": 0.0257906,
        "V19": 0.4039936,  "V20": 0.2514121,  "V21": -0.0183068,
        "V22": 0.2778376,  "V23": -0.1104739, "V24": 0.0669281,
        "V25": 0.1285940,  "V26": -0.1891474, "V27": 0.1335584,
        "V28": -0.0210530,
        "Amount_scaled": 0.2449640,
        "Time_scaled": -0.9949833
    }
    
    result = predict_transaction(fraud_sample)
    result["transaction_id"] = "TEST_FRAUD_SAMPLE"
    result["timestamp"] = datetime.datetime.now().isoformat()
    result["note"] = "This is a test transaction for API verification"
    
    return jsonify(result)

# ROUTE 7 — Blockchain status

@app.route('/api/blockchain/status', methods=['GET'])
def blockchain_status():
    """Returns blockchain connection and statistics."""
    return jsonify(get_blockchain_status())


# ROUTE 8 — Get fraud record from blockchain

@app.route('/api/blockchain/record/<int:record_id>', methods=['GET'])
def get_blockchain_record(record_id):
    """Retrieves a specific fraud record from blockchain."""
    record = get_fraud_record(record_id)
    if "error" in record:
        return jsonify(record), 404
    return jsonify(record)


# ROUTE 9 — Get random transaction from test set

@app.route('/api/demo/random-transaction', methods=['GET'])
def random_transaction():
    """
    Returns a random real transaction from the test set.
    Query param: type = 'fraud' or 'legitimate' or 'random'
    
    This is how the demo panel gets real data instead
    of hardcoded values — guarantees authentic predictions.
    """
    import numpy as np
    import os

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


# Run the app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    
    print("\n" + "="*50)
    print("FRAUD DETECTION API STARTING")
    print("="*50)
    print(f"  URL:   http://localhost:{port}")
    print(f"  Debug: {debug}")
    print("\nAvailable endpoints:")
    print("  GET  /api/health")
    print("  POST /api/predict")
    print("  POST /api/predict/batch")
    print("  GET  /api/transactions")
    print("  GET  /api/model")
    print("  GET  /api/test/fraud-sample")
    print("  GET  /api/blockchain/status")
    print("  GET  /api/blockchain/record/<id>")
    print("  GET  /api/demo/random-transaction")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)