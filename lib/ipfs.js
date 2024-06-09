const axios = require('axios');
require('dotenv').config();

const uploadToIPFS = async (data) => {
    try {
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        const response = await axios.post(url, data, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS');
    }
}
module.exports = uploadToIPFS


