const express = require('express')
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const Redis = require('redis')

const app = express();

const redisClient = Redis.createClient();
redisClient.connect();

redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
});


redisClient.on('connect', () => {
    console.log('Connected to Redis');
});


// cargar el archivo proto
const packageDefinition = protoLoader.loadSync('../proto/res.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});



const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const myService = protoDescriptor.res;

const server = new grpc.Server();
server.addService(myService.ResService.service, {

    // implementa  los metodos RPC aqui 
    List: (_, callback) => {
        redisClient.get('data', (err, reply) => {
            if (err) {
                console.error('Error al obtener datos de Redis:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Error de servidor' });
            } else if (reply) {
                const data = JSON.parse(reply);
                callback(null, { items: data });
            } else {
                // Si los datos no están en el cache, realizar alguna operación para obtenerlos
                // y luego almacenarlos en Redis antes de devolverlos
                const newData = obtenerDatosDeAlgunaFuente();
                redisClient.set('data', JSON.stringify(newData));
                callback(null, { items: newData });
            }
        })
    },
    Get: (call, callback) => {
        const codigo = call.request.codigo;
        const key = `asignatura:${codigo}`;
    
        redisClient.get(key, (err, reply) => {
            if (err) {
                console.error('Redis Error:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
            } else if (reply) {
                const asignatura = JSON.parse(reply);
                callback(null, { asignatura });
            } else {
                callback({ code: grpc.status.NOT_FOUND, message: 'Asignatura not found' });
            }
        });
    },
    
    Create: (call, callback) => {
        const asignatura = call.request;
        const key = `asignatura:${asignatura.codigo}`; // Use a key prefix to organize keys
    
        // Check if the Asignatura already exists to prevent overwriting
        redisClient.get(key, (err, reply) => {
            if (err) {
                console.error('Redis Error:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
            } else if (reply) {
                callback({ code: grpc.status.ALREADY_EXISTS, message: 'Asignatura already exists' });
            } else {
                redisClient.set(key, JSON.stringify(asignatura), (setErr, setReply) => {
                    if (setErr) {
                        console.error('Redis Error on Create:', setErr);
                        callback({ code: grpc.status.INTERNAL, message: 'Failed to create Asignatura' });
                    } else {
                        callback(null, { asignatura });
                    }
                });
            }
        });
    },
    
    Insert: (call, callback) => {
        const asignatura = call.request.asignatura; // Make sure to access the 'asignatura' field if that's how your clients structure the request.
        const key = `asignatura:${asignatura.codigo}`;
    
        // Set the asignatura in Redis regardless of previous existence
        redisClient.set(key, JSON.stringify(asignatura), (err, reply) => {
            if (err) {
                console.error('Redis Error on Insert:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Failed to insert Asignatura' });
            } else {
                callback(null, { success: true });
            }
        });
    },
    
    Update: (call, callback) => {
        const asignatura = call.request;
        const key = `asignatura:${asignatura.codigo}`;
    
        redisClient.get(key, (err, reply) => {
            if (err) {
                console.error('Redis Error:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
            } else if (reply) {
                redisClient.set(key, JSON.stringify(asignatura), (setErr, setReply) => {
                    if (setErr) {
                        console.error('Redis Error on Update:', setErr);
                        callback({ code: grpc.status.INTERNAL, message: 'Failed to update Asignatura' });
                    } else {
                        callback(null, { asignatura });
                    }
                });
            } else {
                callback({ code: grpc.status.NOT_FOUND, message: 'Asignatura not found' });
            }
        });
    },
    
    Delete: (call, callback) => {
        const codigo = call.request.codigo;
        const key = `asignatura:${codigo}`;
    
        redisClient.del(key, (err, reply) => {
            if (err) {
                console.error('Redis Error:', err);
                callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
            } else if (reply === 1) { // Redis returns 1 if the key was deleted
                callback(null, {});
            } else {
                callback({ code: grpc.status.NOT_FOUND, message: 'Asignatura not found' });
            }
        });
    },
    
});

//iniciar servidor gRPC

const grpcPort = '50051';
server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC server running at http://0.0.0.0:${grpcPort}`);
    server.start();
});


const httpPort = 3000;
app.listen(httpPort, () => {
    console.log(`HTTP server running at http://localhost:${httpPort}`);
});