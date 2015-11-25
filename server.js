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

    var imageName = 'simoncrabtree/hubble:1.0';

    git.Clone.clone('https://github.com/limajs/hubble.git', workDir)
      .then(function(repo) {
        console.log("Cloned to " + workDir);
      })
      .then(function() {
        var buildDockerImage = spawn('docker', 
          ['build', '-t', imageName, '.'], 
          {
            cwd: workDir
          }
        );

        buildDockerImage.stdout.on('data', function(data){
          console.log('build_docker_img', data.toString());
        });

        buildDockerImage.on('close', function(code) {
          if(code !== 0){
            return console.log("Error Building Docker image:", code);
          }
        	console.log("Docker Image Built")

          var tagImage = spawn('docker',
            ['tag', imageName, 'localhost:5000/' + imageName]);

          tagImage.on('close', function(code) {
            if(code !== 0){
              return console.log("Error tagging image", code);
            }

            var pushToRegistry = spawn('docker',
              ['push', 'localhost:5000/' + imageName]);

            pushToRegistry.on('data', function(data){
              console.log('push_to_reg', data);
            });

            pushToRegistry.on('close', function(code){
              if(code !== 0)
                return console.log("Error pushing to registry", code);
            });

          });

          tagImage.stdout.on('data', function(data){
            console.log('tag_img', data.toString());
          });

        });


      });
  }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});