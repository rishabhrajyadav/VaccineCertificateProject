const express = require('express');
const axios = require('axios');
const connect = require("./db/connect");
const Certificate = require('./models/Certificate');
const { web3, contract, account } = require('./lib/web3');
const uploadToIPFS = require("./lib/ipfs");
require('dotenv').config();
const PORT = 8000
const app = express();

// MongoDB setup
connect();
app.use(express.json());

// Add certificate details and store IPFS hash on the blockchain
app.post('/add-certificate', async (req, res) => {
    try {
        const { patientAddress, name, dateOfBirth, contactInformation, vaccineType, vaccinationDate, centerIpfsHash } = req.body;
        const patientData = { name, dateOfBirth, contactInformation, vaccineType, vaccinationDate };

        // Upload patient data to IPFS using Pinata
        const ipfsHash = await uploadToIPFS(patientData);

        // Convert IPFS hash to bytes32
        const ipfsHashBytes32 = web3.utils.keccak256(ipfsHash);
        const centerIpfsHashBytes32 = web3.utils.keccak256(centerIpfsHash);

        // Send transaction to the smart contract
        const receipt = await contract.methods.issueCertificate(patientAddress, ipfsHashBytes32,centerIpfsHashBytes32)
            .send({ from: account.address, gas: 3000000 });
           
        // Save certificate data to MongoDB
        const tokenId = receipt.events.CertificateIssued.returnValues.tokenId.toString();
        
        const newCertificate = new Certificate({
            tokenId: tokenId,
            patientAddress: patientAddress,
            ipfsHash: ipfsHash,
            centerIpfsHash: centerIpfsHash, // Include center IPFS hash
            verified: false
        });

        await newCertificate.save();

        res.send({ message: 'Certificate added successfully', transactionHash: receipt.transactionHash, ipfsHash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to add certificate' });
    }
});

//1st transactionHash: 0x66584ba8ab24a3c008e2ff0f6ccd4bbb2e5257b98c45b5167181497197f82020,
//2nd transactionHash: 0xed77285d4a04e09d201b5dbb22da7f82c4baab953554a7e7881af6a71ad394b1
//3rd transactionHash tokenId 4: 0xb81ff4a0299114952a71674b21334d2fe635e0b14807a13276d41d825b92206a

// Add certificate details and store IPFS hash on the blockchain

app.patch('/verify-certificate', async (req, res) => {
    try {
        const { tokenId } = req.body;

        // Send transaction to the smart contract
        const receipt = await contract.methods.verifyCertificate(tokenId)
            .send({ from: account.address, gas: 3000000 });
         
        console.log(receipt.status.toString());    
        
        // Update certificate data in MongoDB
        const updatedCertificate = await Certificate.findOneAndUpdate(
            { tokenId: tokenId },
            { $set: { verified: true } },
            { new: true }
        );

        if (!updatedCertificate) {
            return res.status(404).send({ error: 'Certificate not found' });
        }

        res.send({ message: 'Certificate verified successfully', transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to verify certificate' });
    }
});

//verifying trx of tokenId 2 : 0xe871a8a49af385eb768977ffdda15505f4706ec4cdd2ff5b1e91c8a8cf9fb098
//verifying trx of tokenId 3 : 0x3ab9f31849c7c992b9d34ec23253fe6ee0a990ed828662a5471f0b46a8705c12



// GET route to fetch certificate details
app.get('/certificate/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;

        // Call the smart contract function to get certificate details
        const certificateDetails = await contract.methods.getCertificateDetails(tokenId).call();

        // Extract relevant information from the response
        const patientAddress = certificateDetails[0];
        const ipfsHashBytes32 = certificateDetails[1];
        const verified = certificateDetails[2];

        // Construct the response object
        const response = {
            tokenId: tokenId,
            patientAddress: patientAddress,
            ipfsHashBytes32: ipfsHashBytes32,
            verified: verified
        };

        // Send the response back to the client
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch certificate details' });
    }
}); 


app.listen( PORT , () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

