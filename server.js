var Hapi = require('hapi');
var git = require('nodegit');
var spawn = require('child_process').spawn;

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
  method: 'POST',
  path: '/lucie',
  handler: function(request, reply) {
    console.log("Incoming message from GitHub");
    reply('OK');

    var workDir = 'work_dir_' + request.payload.after;
    console.log("Cloning to " + workDir);

    git.Clone.clone('https://github.com/limajs/hubble.git', workDir)
      .then(function(repo) {
        console.log("Cloned to " + workDir);
      })
      .then(function() {
        var buildDockerImage = spawn('docker', 
          ['build', '-t', 'simoncrabtree/hubble:1.0', '.'], 
          {
            cwd: workDir
          }
        );

        buildDockerImage.stdout.on('data', function(data){
          console.log('stdout:', data);
        });
      });
  }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});