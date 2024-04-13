const express = require('express')
const grpc = require('@grp/grps-js');
const protoLoader = require('@grpc/proto-loader');

const Redis = require('redis')

const app = express();

const redisClient = Redis.createClient();

redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
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
    // Get: (call, callback) => {
        // const key = call.request.key;
        // const value = cache[key];
        // if (value !== undefined) {
            // callback(null, { value });
        // } else {
            // callback({ code: grpc.status.NOT_FOUND, message: 'Key not found' });
        // }
    // },
    // Insert: (call, callback) => {
        // const key = call.request.key;
        // const value = call.request.value;
        // cache[key] = value;
        // callback(null, { success: true });
    // },
    // Update: (call, callback) => {
        // const key = call.request.key;
        // const value = call.request.value;
        // if (cache[key] !== undefined) {
            // cache[key] = value;
            // callback(null, { success: true });
        // } else {
            // callback({ code: grpc.status.NOT_FOUND, message: 'Key not found' });
        // }
    // },
    // Delete: (call, callback) => {
        // const key = call.request.key;
        // if (cache[key] !== undefined) {
            // delete cache[key];
            // callback(null, { success: true });
        // } else {
            // callback({ code: grpc.status.NOT_FOUND, message: 'Key not found' });
        // }
    // },
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