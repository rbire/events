'use strict';
var Fabric_Client = require('fabric-client');
var path = require('path');
var os = require('os');
var config = require('./config.json');
var fabric_client = new Fabric_Client();
var store_path = path.join(os.homedir(), '.hfc-key-store');
console.log(' Store path:'+store_path);

Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    return fabric_client.createUser(
        {
            username: config.user,
            mspid: 'PeerMSP',
            cryptoContent: { 
                privateKey: store_path + '/key.pem', 
                signedCert: store_path + '/cert.pem'  
            }
        });                   
}).catch((err) => {
    console.error('Failed to create user: ' + err);
});
