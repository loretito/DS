const {createClient} = require('redis');

const client1 = createClient({
    url: 'redis://:master1234@172.20.0.2:6379' //ip contendor maestro
});

// const client2 = createClient({
//     url: 'redis://:replica1234@192.168.80.4:6379' //ip contendor esclavo
// });

// const client3 = createClient({
//     url: 'redis://:replica1234@192.168.80.5:6379' //ip contendor esclavo
// });

client1.on('error', (err) => console.log('Redis Client Error', err));

client1.connect();

// client2.on('error', (err) => console.log('Redis Client Error', err));

// client2.connect();

// client3.on('error', (err) => console.log('Redis Client Error', err));

// client3.connect();

module.exports = {client1
    // ,client2,
    // client3
};