const redis = require('redis');

const cluster = redis.createCluster({
    rootNodes: [
      {
        url: 'redis://:master1234@192.168.16.3:6379'
      },
      {
        url: 'redis://:replica1234@192.168.16.4:6379'
      },
      {
        url: 'redis://:replica1234@192.168.16.5:6379'
      }
    ],
    useReplicas : true
  });
  
cluster.on('error', (err) => console.log('Redis Cluster Error', err));
  
cluster.connect();

module.exports = cluster;