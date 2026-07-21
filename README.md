# Fraud-Detection-System-
FraudShield is a full-stack fraud detection system that combines machine learning, blockchain audit logging, and explainable AI to detect and investigate credit card fraud in real time.

## System Architecture
React Frontend 
Flask Backend 
XGBoost + SHAP     
Hardhat Blockchain 
SQLite Database

## Tech Stack
Frontend-React 18, TanStack Query, Recharts, ethers.js
Backend-Flask, Flask-JWT-Extended, SQLAlchemy, Flask-Bcrypt
Machine Learning-XGBoost, SHAP, scikit-learn, imbalanced-learn
Blockchain-Solidity, Hardhat, Web3.py
Database-SQLite

## Features
Real-time fraud detection using XGBoost (82.11% recall, 61.90% precision, 96.59% ROC-AUC)
Explainable AI via SHAP TreeExplainer — every prediction shows which features drove the decision
Immutable blockchain audit log — every fraud detection is permanently recorded on a Hardhat local blockchain with SHAP explanations
Role-based access control — System Administrator and Fraud Analyst roles with JWT authentication
Human-in-the-loop investigation — analysts can review fraud predictions and flag legitimate transactions as suspicious
Password request workflow — analysts submit password change requests that admins approve or reject
Demo panel — sends real transactions from the 56,746-row test set through the full ML + blockchain pipeline

## Prerequisites
Python	3.13
pip	26.1.1
Node.js	22.17.1
npm	10.9.2
Hardhat	2.22.17

## Setup and Installation
1. Clone the repository
git clone <your-repo-url>
cd FraudShield

3. Blockchain setup
Open a terminal in the blockchain folder.
Install dependencies:
cd blockchain
npm install
Start the local Hardhat node (keep this terminal open):
npm run node.
Deploy the smart contract (open a new terminal in blockchain):
npm run deploy

4. Backend setup

Open a terminal in the backend folder.
Install dependencies:
cd backend
Create your .env file:

JWT_SECRET_KEY=your-strong-random-secret-here
OWNER_ADDRESS=xxxxx
OWNER_PRIVATE_KEY=xxxx
PORT=5000
DEBUG=True
Note: The OWNER_ADDRESS and OWNER_PRIVATE_KEY above are Hardhat's default test account #0. 

Start the Flask server:
python app.py

On first run, a default admin account is created automatically:

4. Frontend setup
Open a terminal in the frontend folder.
Install dependencies:
cd frontend
npm install
Start the React app:
npm run start

