var efc    = require('./efc.js');
var config = require('./config.json');

module.exports = (function() {
return{
	get_all_events: function(req, res){
		var q = req.params.query.split("|");
		const request = {
			chaincodeId: config.chaincode,
			txId: null,
			fcn: 'queryAllEvents',
			args:  ["{\"selector\": {\""+ q[0] +"\": {\""+ q[1] +"\": \""+ q[2] + "\"}}}"]
		};
		efc.query_events(request,res);
	},
	add_events: function(req, res){
		var array = req.params.events.split("|");
		console.log(array);		
		const request = {
			chaincodeId: config.chaincode,
			fcn: 'recordEvents',
			args: array,
			chainId: 'channel1',
			txId: null
		};
		efc.submit_events(request,res);
	},
	add: function(req, res){
		/*
		{
			"subject": "app-1010",
			"system": "agent onboarding",
			"subjectType": "application",
			"entity": "broker",
			"event": "application",
			"state": "started",
			"date": "Date",
			"application": "TestNet",
			"version": "1.0",
			"recorder": "urn:ouid:eXp-041-41-09"
		}
		*/
		var missing = [];
		var array = ["subject","system","subjectType","entity","event","state","date","application","version","recorder"].map(v=>{
			val = req.body[v]
			if(!val || val==''){
				val = v=="version"?"1.0":val
				val = v=="application"?"Test":val
				val = v=="date"?new Date().toUTCString():val
			}
			if(!val || val==''){
				missing.push(v)
			}
			return val
		})
		if(missing.length>0){
			res.send({
				"required":missing
		})
		}else{
			console.log(array);		
			const request = {
				chaincodeId: config.chaincode,
				fcn: 'recordEvents',
				args: array,
				chainId: 'channel1',
				txId: null
			};
			efc.submit_events(request,res);
		}
	},
	get_events: function(req, res){
		var key = req.params.id
		const request = {
			chaincodeId: config.chaincode,
			txId: null,
			fcn: 'queryEvents',
			args: [key]
		};
		efc.query_events(request,res);
	},
	get_events_history: function(req, res){
		var key = req.params.id
		const request = {
			chaincodeId: config.chaincode,
			txId: null,
			fcn: 'getHistory',
			args: [key]
		};
		efc.query_events(request,res);
	}
}
})();