// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentVault {

    struct ConsentRecord {
        bytes32 id;
        bool status;
        uint256 timestamp;
    }

    // Current consent status
    mapping(bytes32 => bool) public consentStatus;

    // History of consent actions
    mapping(bytes32 => ConsentRecord[]) private consentHistory;

    // Store or update consent
    function storeConsentHash(bytes32 id, bool status) public {
        consentStatus[id] = status;

        consentHistory[id].push(
            ConsentRecord({
                id: id,
                status: status,
                timestamp: block.timestamp
            })
        );
    }

    // Check consent status
    function verifyConsentHash(bytes32 id) public view returns (bool) {
        return consentStatus[id];
    }

    // Revoke consent
    function revokeConsentHash(bytes32 id) public {
        consentStatus[id] = false;

        consentHistory[id].push(
            ConsentRecord({
                id: id,
                status: false,
                timestamp: block.timestamp
            })
        );
    }

    // Get full consent history
    function getConsentHistory(bytes32 id)
        public
        view
        returns (ConsentRecord[] memory)
    {
        return consentHistory[id];
    }
}
