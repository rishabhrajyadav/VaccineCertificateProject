const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    tokenId: { type: Number, required: true },
    name : { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    email: { type: String, required: true , unique : true , 
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }},
    patientAddress: { type: String, required: true , unique: true},
    contactAddress: { type: String, required: true},
    mobileNumber : { type: Number, required: true , unique: true ,
        validate: {
            validator: function(v) {
                return /^[1-9]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number! It must be 10 digits and not start with 0.`
        }},
    centerLocation: { type: String, required: true },
    verified: { type: Boolean, default: false }
});
/* const CertificateSchema = new mongoose.Schema({
    tokenId: { type: Number, required: true },
    contactAddress: { type: String, required: true },
    patientAddress: { type: String, required: true , unique: true},
    ipfsHash: { type: String, required: true },
    centerLocation: { type: String, required: true },
    verified: { type: Boolean, default: false }
}); */

module.exports = mongoose.model('Certificate', CertificateSchema);
