from web3 import Web3
import json
import os
import time
from dotenv import load_dotenv
# Connect to local Hardhat blockchain

# Hardhat node runs on port 8545
HARDHAT_URL = "http://127.0.0.1:8545"


# Flask uses this account to sign and send transactions
OWNER_ADDRESS  = os.getenv('OWNER_ADDRESS')
OWNER_PRIVATE_KEY = os.getenv('OWNER_PRIVATE_KEY')
# Connect to blockchain
w3 = Web3(Web3.HTTPProvider(HARDHAT_URL))

# Load contract

def load_contract():
    """ Loads the deployed smart contract using:
    1. The contract address from deployment_info.json
    2. The ABI from the compiled artifacts folder
    
    ABI = Application Binary Interface
    It tells Web3 what functions the contract has and what parameters they expect — like an API schema """
    # Load deployment info
    deployment_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'deployment_info.json'
    )
    
    with open(deployment_path, 'r') as f:
        deployment_info = json.load(f)
    
    contract_address = deployment_info['contractAddress']
    
    # Load ABI from compiled artifacts
    # Hardhat generates this automatically when you compile
    base_dir = os.path.dirname(os.path.dirname(
        os.path.abspath(__file__)
    ))
    abi_path = os.path.join(
        base_dir,
        'blockchain',
        'artifacts',
        'contracts',
        'FraudAuditLog.sol',
        'FraudAuditLog.json'
    )
    
    with open(abi_path, 'r') as f:
        contract_json = json.load(f)
    
    abi = contract_json['abi']
    
    # Create contract instance
    contract = w3.eth.contract(
        address=contract_address,
        abi=abi
    )
    
    return contract


# Load contract once when module is imported
print("Connecting to blockchain")
try:
    if w3.is_connected():
        print(f"Connected to Hardhat node at {HARDHAT_URL}")
        print(f"Chain ID: {w3.eth.chain_id}")
        contract = load_contract()
        print(f"Contract loaded successfully")
        BLOCKCHAIN_AVAILABLE = True
    else:
        print("WARNING: Could not connect to Hardhat node")
        print("Start it with: npm run node")
        BLOCKCHAIN_AVAILABLE = False
        contract = None
except Exception as e:
    print(f"WARNING: Blockchain connection failed: {e}")
    BLOCKCHAIN_AVAILABLE = False
    contract = None

# MAIN FUNCTION — Log fraud to blockchain

def log_fraud_to_blockchain(blockchain_log: dict) -> dict:
    """ Takes the blockchain_log dict from predictor.py and writes it to the smart contract.
    Returns a result dict with:
    - success: True/False
    - transaction_hash: the blockchain tx hash
    - block_number: which block it was mined in
    - record_id: the fraud record ID on chain
    - gas_used: how much computation it took """
    
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return {
            "success": False,
            "error": "Blockchain not available"
        }
    
    try:
        # Extract data from blockchain_log
        transaction_id  = blockchain_log['transaction_id']
        confidence      = blockchain_log['confidence']
        model_version   = blockchain_log['model_version']
        top_3_features  = blockchain_log['top_3_features']
        
        # Convert confidence to integer (no decimals in Solidity)
        # 99.86% → 9986
        confidence_int = int(confidence * 100)
        
        # Extract feature arrays
        feature_names = [f['feature'] for f in top_3_features]
        # Convert SHAP values to integers (multiply by 10000)
        # 3.9407 → 39407
        shap_values = [int(f['shap_value'] * 10000) 
                      for f in top_3_features]
        directions  = [f['direction'] for f in top_3_features]
        
        # Build the transaction
        # get_transaction_count gives us the nonce
        # nonce prevents replay attacks — each tx must be unique
        nonce = w3.eth.get_transaction_count(OWNER_ADDRESS)
        
        # Call the smart contract function
        txn = contract.functions.logFraudRecord(
            transaction_id,
            confidence_int,
            model_version,
            feature_names,
            shap_values,
            directions
        ).build_transaction({
            'chainId': 31337,
            'gas': 500000,        # max gas units to use
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
            'from': OWNER_ADDRESS
        })
        
        # Sign the transaction with owner private key
        signed_txn = w3.eth.account.sign_transaction(
            txn, 
            private_key=OWNER_PRIVATE_KEY
        )
        
        # Send to blockchain
        tx_hash = w3.eth.send_raw_transaction(
            signed_txn.raw_transaction
        )
        
        # Wait for it to be mined
        # timeout=30 means wait max 30 seconds
        receipt = w3.eth.wait_for_transaction_receipt(
            tx_hash, 
            timeout=30
        )
        
        # Get the record ID from the event logs
        try:
            fraud_logged_event = contract.events.FraudLogged()
            logs = fraud_logged_event.process_receipt(receipt)
            if logs and len(logs) > 0:
                record_id = logs[0]['args']['recordId']
            else:
                # Fallback — read directly from contract
                record_id = contract.functions.getTotalRecords().call()
        except Exception as log_error:
            print(f"Event log parsing note: {log_error}")
            # Fallback — read total records from contract directly
            record_id = contract.functions.getTotalRecords().call()
        
        result = {
            "success": True,
            "transaction_hash": receipt['transactionHash'].hex(),
            "block_number": receipt['blockNumber'],
            "record_id": int(record_id) if record_id else None,
            "gas_used": receipt['gasUsed'],
            "blockchain_timestamp": time.time()
        }
        
        print(f"Fraud logged to blockchain!")
        print(f"  TX Hash:    {result['transaction_hash']}")
        print(f"  Block:      {result['block_number']}")
        print(f"  Record ID:  {result['record_id']}")
        print(f"  Gas used:   {result['gas_used']}")
        
        return result
        
    except Exception as e:
        print(f"Blockchain logging failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# HELPER — Read a fraud record from blockchain

def get_fraud_record(record_id: int) -> dict:
    """
    Retrieves a fraud record from the blockchain by ID.
    Used by the dashboard to display audit trail.
    """
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return {"error": "Blockchain not available"}
    
    try:
        record = contract.functions.getFraudRecord(
            record_id
        ).call()
        
        return {
            "record_id":       int(record[0]),
            "transaction_id":  record[1],
            "timestamp":       int(record[2]),
            "confidence":      int(record[3]) / 100,
            "model_version":   record[4],
            "features": [
                {
                    "name":       record[5][i],
                    "shap_value": int(record[6][i]) / 10000,
                    "direction":  record[7][i]
                }
                for i in range(3)
            ]
        }
    except Exception as e:
        return {"error": str(e)}

# HELPER — Get total records on blockchain


def get_total_records() -> int:
    """Returns total fraud records logged to blockchain."""
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return 0
    try:
        result = contract.functions.getTotalRecords().call()
        return int(result)
    except Exception as e:
        print(f"getTotalRecords error: {e}")
        return 0


# HELPER — Check blockchain connection status


def get_blockchain_status() -> dict:
    """Returns current blockchain connection status."""
    if not BLOCKCHAIN_AVAILABLE:
        return {
            "connected": False,
            "message": "Hardhat node not running"
        }
    try:
        # Call contract directly to get accurate count
        total = int(contract.functions.getTotalRecords().call())
        return {
            "connected":            True,
            "chain_id":             w3.eth.chain_id,
            "block_number":         w3.eth.block_number,
            "total_fraud_records":  total,
            "contract_address":     contract.address,
            "node_url":             HARDHAT_URL
        }
    except Exception as e:
        return {
            "connected": False,
            "error":     str(e)
        }