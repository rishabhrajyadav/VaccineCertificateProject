// models/Center.js
const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
    centerId: {
        type: Number,
        required: true,
        unique: true
    },
    centerAddress: {
        type: String,
        required: true,
        unique: true
    },
    centerName: {
        type: String,
        required: true
    },
    centerLocationAddress: {
        type: String,
        required: true,
    },
    centerCity: {
        type: String,
        required: true
    }
});

const Center = mongoose.model('Center', centerSchema);

module.exports = Center;
