'use strict';
var app = angular.module('application', []);
// Angular Controller
app.controller('appController', function($scope, appFactory){
	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();
	$("#event_history").hide();
	$scope.systems = ["Property Listing Service", "Property Registry Service", "Broker Referral Tracking", "Mortgage Industry Service", "Transaction Management Service"];
	$scope.resources = ["Property","Referral","Tax", "Agent", "Office", "Loan", "Transaction"];
	$scope.entities = ["Builder","Broker", "MLS", "Escrow", "County", "City", "Lender","Agent","Owner", "Buyer", "Vendor" ];
	$scope.events = [ "Listing", "Appraisal", "Assessment", "Construction", "Identity", "Improvment", "Contract","Application", "Referral", "Offer","Openhouse", "Price", "Status", "Deed", "Lein", "Permit" ];
	$scope.actions = ["Accepted","Received","Recorded", "Rejected","Signed","Completed","Created","Changed", "Published", "Funded", "Closed" ];
	$scope.record = {
        arg_6: new Date()
	  };
	$scope.query = {
		arg:"arg_0",
		op:"$regex",
		val:""
	};
	$scope.queryAllEvents = function(){
		$("#event_history").hide();
		var query = $scope.query.arg +'|' + $scope.query.op +'|' + $scope.query.val
		appFactory.queryAllEvents(query,function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				parseInt(data[i].Key);
				data[i].Record.Key = parseInt(data[i].Key);
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return parseFloat(a.Key) - parseFloat(b.Key);
			});
			$scope.all_events = array;
		});
	}
	$scope.queryHistory = function(id){
		appFactory.queryEventHistory(id, function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				array.push(data[i].Value);
			}
			$scope.event_history = array;
			$("#event_history").show();
		});
	}


	$scope.recordEvents = function(){
		$scope.create_events = "Sending..";
		$("#success_create").show();
		appFactory.recordEvents($scope.record, function(data){
			$scope.create_events = "Success! TxId:" + data;
		});
	}
});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

    factory.queryAllEvents = function(query,callback){
    	$http.get('/get_all_events/'+query).success(function(output){
			callback(output)
		});
	}

	factory.queryEvents = function(id, callback){
    	$http.get('/get_event/'+id).success(function(output){
			callback(output)
		});
	}

	factory.queryEventHistory = function(id, callback){
    	$http.get('/get_event_history/'+id).success(function(output){
			callback(output)
		});
	}

	factory.recordEvents = function(data, callback){
		var record = 
		data.arg_0 + "|" 
		+ data.arg_1 + "|" 
		+ data.arg_2 + "|" 
		+ data.arg_3 + "|" 
		+ data.arg_4 + "|" 
		+ data.arg_5+ "|" 
		+ data.arg_6
		+ '|v1.0'
		+ '|beta';
    	$http.get('/add_event/'+record).success(function(output){
			callback(output)
		});
	}
	return factory;
});


