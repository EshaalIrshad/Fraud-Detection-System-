import joblib  #to load saved ML files 
import numpy as np  # mathematical operations 
import pandas as pd  # handling tables/dataframes
import shap
import time  #prediction speed
import os

# Load model and explainer once when server starts
# Loading happens once at startup, not on every request
# This is what makes predictions fast — the model stays in memory ready to score transactions instantly

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH    = os.path.join(BASE_DIR, 'ml', 'xgboost_fraud_model.pkl')
EXPLAINER_PATH = os.path.join(BASE_DIR, 'ml', 'shap_explainer.pkl')
FEATURES_PATH  = os.path.join(BASE_DIR, 'ml', 'feature_names.pkl')

print("Loading ML model...")
xgb_model     = joblib.load(MODEL_PATH)
shap_explainer = joblib.load(EXPLAINER_PATH)
feature_names  = joblib.load(FEATURES_PATH)
print(f"Model loaded — {len(feature_names)} features ready")


def predict_transaction(transaction_data: dict) -> dict:

    """Takes a single transaction as a dictionary, returns prediction, confidence and SHAP explanations.
    Core function- Flask API calls every time a transaction needs to be scored."""
    start_time = time.time()
    
    # Convert input to DataFrame
    # The model expects features in exact same order as training data — feature_names ensures this
    try:
        input_df = pd.DataFrame([transaction_data], 
                                 columns=feature_names)
    except Exception as e:
        return {"error": f"Invalid transaction format: {str(e)}"}
    
    # Get fraud prediction 
    # predict() returns 0 (legitimate) or 1 (fraud)
    # predict_proba() returns probability for each class
    # We want [:, 1] which is the fraud probability
    prediction    = int(xgb_model.predict(input_df)[0])
    probabilities = xgb_model.predict_proba(input_df)[0]
    fraud_probability = float(probabilities[1])
    
    #Generate SHAP explanation
    # TreeExplainer runs in milliseconds for one transaction
    # shap_values shape: (1, 30) — one value per feature
    shap_values = shap_explainer.shap_values(input_df)
    
    # Get top 5 features by absolute SHAP value
    shap_series = pd.Series(
        np.abs(shap_values[0]), 
        index=feature_names
    ).sort_values(ascending=False)
    
    top_features = []
    for feature in shap_series.head(5).index:
        shap_val = float(shap_values[0][feature_names.index(feature)])
        top_features.append({
            "feature": feature,
            "shap_value": round(shap_val, 4),
            "feature_value": round(float(transaction_data[feature]), 4),
            "direction": "FRAUD" if shap_val > 0 else "LEGITIMATE"
        })
    
    # Calculate response time 
    response_time_ms = round((time.time() - start_time) * 1000, 2)
    
    # Build result 
    # This is the exact structure that gets:
    # Returned to the React dashboard
    # Logged to the blockchain smart contract (if fraud)
    result = {
        "prediction": prediction,
        "prediction_label": "FRAUD" if prediction == 1 else "LEGITIMATE",
        "fraud_probability": round(fraud_probability * 100, 4),
        "confidence": round(max(fraud_probability, 
                               1 - fraud_probability) * 100, 4),
        "top_features": top_features,
        "response_time_ms": response_time_ms,
        "should_log_to_blockchain": prediction == 1 and 
                                     fraud_probability > 0.5
    }
    
    return result


def get_model_info() -> dict:
    """Returns model metadata for the dashboard."""
    return {
        "model_name": "XGBoost Fraud Detector",
        "version": "1.0.0",
        "features": len(feature_names),
        "feature_names": feature_names,
        "description": "XGBoost classifier trained on European "
                       "Credit Card Fraud dataset with SMOTE balancing"
    }