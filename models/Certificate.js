const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    tokenId: { type: Number, required: true },
    patientAddress: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    centerLocation: { type: String, required: true },
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
