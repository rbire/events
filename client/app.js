'use strict';
var app = angular.module('application', []);
// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();
	
	$scope.queryAllEvents = function(){

		appFactory.queryAllEvents(function(data){
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

	$scope.queryEvents = function(){

		var id = $scope.record_id;

		appFactory.queryEvents(id, function(data){
			$scope.query_events = data;

			if ($scope.query_events == "Could not locate Events"){
				console.log()
				$("#error_query").show();
			} else{
				$("#error_query").hide();
			}
		});
	}

	$scope.recordEvents = function(){

		appFactory.recordEvents($scope.record, function(data){
			$scope.create_events = data;
			$("#success_create").show();
		});
	}
});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

    factory.queryAllEvents = function(callback){

    	$http.get('/get_all_events/').success(function(output){
			callback(output)
		});
	}

	factory.queryEvents = function(id, callback){
    	$http.get('/get_event/'+id).success(function(output){
			callback(output)
		});
	}

	factory.recordEvents = function(data, callback){
		var record = data.id + "-" + data.category + "-" + data.name + "-" + data.timestamp + "-" + data.data;

    	$http.get('/add_event/'+record).success(function(output){
			callback(output)
		});
	}
	return factory;
});


