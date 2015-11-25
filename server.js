var Hapi = require('hapi');
var git = require('nodegit');

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
  method: 'POST',
  path: '/lucie',
  handler: function(request, reply) {
    console.log("Incoming message from GitHub", request.payload);
    reply('OK');

    git.Clone.clone('https://github.com/limajs/hubble.git', 'work_dir_' + request.payload.after)
      .then(function(repo) {
        console.log("Cloned", request.payload.after);
      });
  }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});