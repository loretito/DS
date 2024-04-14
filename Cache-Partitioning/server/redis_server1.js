const { spawn } = require('child_process');

const redisServer1 = spawn('redis-server', ['--port', '6379', '--save', '""', '--appendonly', 'no']);

redisServer1.stdout.on('data', (data) => {
  console.log(`Redis Server 1: ${data}`);
});

redisServer1.stderr.on('data', (data) => {
  console.error(`Redis Server 1 Error: ${data}`);
});

redisServer1.on('close', (code) => {
  console.log(`Redis server 1 process exited with code ${code}`);
});
