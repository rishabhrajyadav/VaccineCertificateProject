const { Web3 } = require('web3');
const abi = require('../abi/abi.json')
const abi2 = require('../abi/abi2.json')
const abi3 = require('../abi/abi3.json')
require('dotenv').config();

const web3 = new Web3(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const contractABI = abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

module.exports = {
    web3,
    contract,
    account
};
