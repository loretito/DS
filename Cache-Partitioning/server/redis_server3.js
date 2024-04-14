const { spawn } = require('child_process');

const redisServer3 = spawn('redis-server', ['--port', '6381', '--save', '""', '--appendonly', 'no']);

redisServer3.stdout.on('data', (data) => {
  console.log(`Redis Server 3: ${data}`);
});

redisServer3.stderr.on('data', (data) => {
  console.error(`Redis Server 3 Error: ${data}`);
});

redisServer3.on('close', (code) => {
  console.log(`Redis server 3 process exited with code ${code}`);
});
