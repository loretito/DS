const { spawn } = require('child_process');

const redisServer2 = spawn('redis-server', ['--port', '6380', '--save', '""', '--appendonly', 'no']);

redisServer2.stdout.on('data', (data) => {
  console.log(`Redis Server 2: ${data}`);
});

redisServer2.stderr.on('data', (data) => {
  console.error(`Redis Server 2 Error: ${data}`);
});

redisServer2.on('close', (code) => {
  console.log(`Redis server 2 process exited with code ${code}`);
});
