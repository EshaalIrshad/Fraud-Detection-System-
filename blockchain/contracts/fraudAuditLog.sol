// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
    FraudAuditLog Smart Contract
    What gets stored for each flagged transaction:
     Transaction ID
     Timestamp
     Fraud confidence score
     Top 3 SHAP feature explanations
     Model version that made the prediction
    Only the contract owner can log new fraud records 
 */

contract FraudAuditLog {

    // Contract owner
    address public owner;

    // Fraud record counter
    // Increments with every new fraud log
    uint256 public totalFraudRecords;

    // Data structures
    
    // Represents one SHAP feature explanation
    struct FeatureExplanation {
        string featureName;    // e.g. "V14"
        int256 shapValue;      // multiplied by 10000 to avoid decimals
                               // e.g. 3.9407 stored as 39407
        string direction;      // "FRAUD" or "LEGITIMATE"
    }

    // Represents one complete fraud audit record
    struct FraudRecord {
        uint256 recordId;                    // auto-incrementing ID
        string transactionId;                // e.g. "TXN_000123"
        uint256 timestamp;                   // Unix timestamp
        uint256 confidenceScore;             // e.g. 9986 = 99.86%
        string modelVersion;                 // e.g. "xgboost_v1.0"
        FeatureExplanation[3] topFeatures;   // top 3 SHAP features
        bool exists;                         // for checking if record exists
    }

    // Storage
    // Maps record ID to fraud record
    mapping(uint256 => FraudRecord) public fraudRecords;
    
    // Maps transaction ID to record ID
    // Allows looking up a record by transaction ID
    mapping(string => uint256) public transactionToRecord;

    // Events
    // Events are emitted when something important happens
    // Flask backend listens for these to confirm logging worked
    event FraudLogged(
        uint256 indexed recordId,
        string transactionId,
        uint256 confidenceScore,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // Modifiers
    // onlyOwner restricts certain functions to the contract owner
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can log fraud records"
        );
        _;
    }

    // Constructor
    // Runs once when contract is deployed
    // Sets the deployer as the owner
    constructor() {
        owner = msg.sender;
        totalFraudRecords = 0;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // FUNCTION 1 — Log a fraud record
    function logFraudRecord(
        string memory _transactionId,
        uint256 _confidenceScore,
        string memory _modelVersion,
        string[3] memory _featureNames,
        int256[3] memory _shapValues,
        string[3] memory _directions
    ) public onlyOwner returns (uint256) {
        
        // Increment record counter
        totalFraudRecords++;
        uint256 newRecordId = totalFraudRecords;

        // Build the fraud record in storage
        FraudRecord storage record = fraudRecords[newRecordId];
        record.recordId      = newRecordId;
        record.transactionId = _transactionId;
        record.timestamp     = block.timestamp;
        record.confidenceScore = _confidenceScore;
        record.modelVersion  = _modelVersion;
        record.exists        = true;

        // Store top 3 SHAP features
        for (uint i = 0; i < 3; i++) {
            record.topFeatures[i] = FeatureExplanation({
                featureName: _featureNames[i],
                shapValue:   _shapValues[i],
                direction:   _directions[i]
            });
        }

        // Map transaction ID to record ID for easy lookup
        transactionToRecord[_transactionId] = newRecordId;

        // Emit event so Flask backend knows it was logged
        emit FraudLogged(
            newRecordId,
            _transactionId,
            _confidenceScore,
            block.timestamp
        );

        return newRecordId;
    }

    // FUNCTION 2 — Get a fraud record by record ID
    function getFraudRecord(uint256 _recordId) 
        public view returns (
            uint256 recordId,
            string memory transactionId,
            uint256 timestamp,
            uint256 confidenceScore,
            string memory modelVersion,
            string[3] memory featureNames,
            int256[3] memory shapValues,
            string[3] memory directions
        ) 
    {
        require(
            fraudRecords[_recordId].exists,
            "Record does not exist"
        );

        FraudRecord storage record = fraudRecords[_recordId];
        
        // Extract feature arrays for return
        string[3] memory names;
        int256[3] memory values;
        string[3] memory dirs;
        
        for (uint i = 0; i < 3; i++) {
            names[i]  = record.topFeatures[i].featureName;
            values[i] = record.topFeatures[i].shapValue;
            dirs[i]   = record.topFeatures[i].direction;
        }

        return (
            record.recordId,
            record.transactionId,
            record.timestamp,
            record.confidenceScore,
            record.modelVersion,
            names,
            values,
            dirs
        );
    }

    // FUNCTION 3 — Get record by transaction ID
    function getRecordByTransactionId(string memory _transactionId)
        public view returns (uint256)
    {
        uint256 recordId = transactionToRecord[_transactionId];
        require(recordId != 0, "Transaction not found in audit log");
        return recordId;
    }

    // FUNCTION 4 — Check if transaction was flagged as fraud
    function isTransactionFlagged(string memory _transactionId)
        public view returns (bool)
    {
        return transactionToRecord[_transactionId] != 0;
    }

    // FUNCTION 5 — Get total fraud records logged
    function getTotalRecords() public view returns (uint256) {
        return totalFraudRecords;
    }

    // FUNCTION 6 — Transfer ownership to new address
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}