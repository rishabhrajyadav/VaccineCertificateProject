// SPDX-License-Identifier: MIT
//1st contract address = 0x5c10252bD8224e2b1A33e20dF4Aa170C5393fAf4
//2nd contract address = 0x21db3061C6d61142cF3D993ABc46adC607d59901
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaccineCertification is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _centerIdCounter;

    error InvalidCenterId();
    error CertificateNotExists();
    error NotAnAuthorizedParty();

    struct Center {
        address center;
        string centerName;
        string centerAddress;
        string location;
    }

    struct Certificate {
        address patient;
        string patientIpfs; // IPFS  of the patient data
        string centerLocation; // IPFS  of the center data
        bool verified;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => Center) public centers;
    mapping(address => bool) public authorizedCenters;
    
    modifier onlyOwnerOrCenter() {
        if(msg.sender != owner() && !authorizedCenters[msg.sender]) revert NotAnAuthorizedParty();
        _;
    }

    modifier validCenterId(uint256 _centerId){
        uint256 centerId = _centerIdCounter.current();
        if(_centerId > centerId) revert InvalidCenterId();
        _;
    }

    modifier _validTokenId(uint256 _tokenId){
        uint256 lastTokenId = _tokenIdCounter.current();
        if(_tokenId > lastTokenId) revert CertificateNotExists(); 
        _;
    }

    constructor() ERC721("VaccineCertification", "VACCINE") Ownable(msg.sender) {}

    // Event emitted when a new certificate is issued
    event CertificateIssued(uint256 indexed tokenId, address indexed patient, string indexed patientIpfs, string centerLocation);
    event VerifyCertificate(uint256 indexed tokenId, bool indexed verified, string  patientIpfs);
    event CenterAdded(uint256 indexed centerId, address indexed centerAddress, string _centerName, string _centerLocationAddress, string _centerCity );
    event CenterUpdated(uint256 indexed centerId, address indexed centerAddress, string _centerName, string _centerLocationAddress, string _centerCity);

    // Function to issue a new certificate
    function issueCertificate(
        address _patient,
        string memory _patientIpfs,
        string memory _centerLocation
    ) external onlyOwnerOrCenter {
         _tokenIdCounter.increment();
         uint256 tokenId = _tokenIdCounter.current();

        _safeMint(_patient , tokenId); // Mint certificate NFT
        certificates[tokenId] = Certificate(_patient, _patientIpfs, _centerLocation, false); // Store certificate data

        emit CertificateIssued(tokenId, _patient, _patientIpfs, _centerLocation); // Emit event
    }

    // Function to verify a certificate
    function verifyCertificate(uint256 _tokenId) external onlyOwner _validTokenId(_tokenId) {
        require(_tokenId <= _tokenIdCounter.current(), "Certificate does not exist");
        string memory patientIpfs = certificates[_tokenId].patientIpfs;
        certificates[_tokenId].verified = true; // Mark certificate as verified
        emit VerifyCertificate(_tokenId, true, patientIpfs);
    }

    // Function to get certificate details by token ID
    function getCertificateDetails(uint256 _tokenId) external _validTokenId(_tokenId) view returns (address, string memory, string memory, bool) {
        require(_tokenId <= _tokenIdCounter.current(), "Certificate does not exist");
        Certificate memory cert = certificates[_tokenId];
        return (cert.patient, cert.patientIpfs, cert.centerLocation, cert.verified);
    }

    function addVaccinationCenter(address _centerAddress, string memory _centerName, string memory _centerLocationAddress, string memory _centerCity) 
        external onlyOwner
    {   
        //if(centerAlreadyExist(_centerName)) revert CenterAlreadyExist();
        _centerIdCounter.increment();
        uint256 newCenterId = _centerIdCounter.current();
    
        centers[newCenterId] = Center(_centerAddress, _centerName, _centerLocationAddress,_centerCity);
        authorizedCenters[_centerAddress] = true;
        emit CenterAdded(newCenterId, _centerAddress, _centerName, _centerLocationAddress,_centerCity );
    }

    function updateVaccinationCenter(uint256 _centerId, address _centerAddress, string memory _centerName, string memory _centerLocationAddress, string memory _centerCity) 
       external onlyOwner validCenterId(_centerId) 
    {
        centers[_centerId] = Center(_centerAddress, _centerName, _centerLocationAddress, _centerCity);
        authorizedCenters[_centerAddress] = true;
        emit CenterUpdated(_centerId, _centerAddress, _centerName, _centerLocationAddress,_centerCity );
    }

    function getCenterDetails(uint256 _centerId)
     external onlyOwner validCenterId(_centerId) view returns (Center memory)
    {
        return centers[_centerId];
    }

}