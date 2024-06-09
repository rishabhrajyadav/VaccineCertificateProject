const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    patientAddress: { type: String, required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    contactInformation: { type: String, required: true },
    vaccineType: { type: String, required: true },
    vaccinationDate: { type: Date, required: true },
    centerIpfsHash: { type: String, required: true }
});

module.exports = mongoose.model('Patient', PatientSchema);
