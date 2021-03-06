//SPDX-License-Identifier: Apache-2.0

var events = require('./controller.js');

module.exports = function(app){
  app.get('/get_event/:id', function(req, res){
    events.get_events(req, res);
  });
  app.get('/get_event_history/:id', function(req, res){
    events.get_events_history(req, res);
  });
  app.get('/add_event/:events', function(req, res){
    events.add_events(req, res);
  });
  app.get('/get_all_events/:query', function(req, res){
    events.get_all_events(req, res);
  });
  app.post('/add', function(req, res){
    events.add(req, res);
  });
}
