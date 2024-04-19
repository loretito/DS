const Redis = require('ioredis')

/**
 * Get an existing Redis client instance. Build one if necessary
 * @return {Redis|null} redis client
 * */
function buildRedisClient() {
  
  try {
    const masterHost = process.env.REDIS_MASTER_HOST;
    const masterPort = process.env.REDIS_MASTER_PORT;

    const client = new Redis({
      host: masterHost,
      port: masterPort,
      password: "master1234",
      enableAutoPipelining: true, // Optional: Enable auto-pipelining for performance
    })

    client.on('error', error => {
      console.error('Redis Error', error)
    })

    client.on('connect', () => {
      console.log('Redis Connection stablished')
    })

    client.on('ready', () => {
      console.log('Redis client ready')
    })

    client.on('end', () => {
      console.log('Redis client connection ended')
    })

    return client
  } catch (error) {
    console.error('Could not create a Redis client', error)

    return null
  }
}

module.exports = buildRedisClient
