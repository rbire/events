var efc 		  = require('./efc.js');
module.exports = (function() {
return{
	get_all_events: function(req, res){
		var q = req.params.query.split("|");
		const request = {
			chaincodeId: 'events',
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
			chaincodeId: 'events',
			fcn: 'recordEvents',
			args: array,
			chainId: 'mychannel',
			txId: null
		};
		efc.submit_events(request,res);
	},
	get_events: function(req, res){
		var key = req.params.id
		const request = {
			chaincodeId: 'events',
			txId: null,
			fcn: 'queryEvents',
			args: [key]
		};
		efc.query_events(request,res);
	},
	get_events_history: function(req, res){
		var key = req.params.id
		const request = {
			chaincodeId: 'events',
			txId: null,
			fcn: 'getHistory',
			args: [key]
		};
		efc.query_events(request,res);
	}
}
})();