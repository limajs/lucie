var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
	method: 'POST',
	path: '/lucie',
	handler: function(request, reply) {
		console.log("Incoming message from GitHub");
		reply('OK');
	}
})

server.start(function () {
    console.log('Server running at:', server.info.uri);
});