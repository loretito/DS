const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./services.proto";
const Redis = require('ioredis');
const postgres = require("../postgres.js");

const redisMaster = new Redis({ port: 6379, host: 'redis-master', password: 'master1234' });
const redisReplicas = [
    new Redis({ port: 6380, host: 'redis-replica-uno', password: 'replica1234' }),
    new Redis({ port: 6381, host: 'redis-replica-dos', password: 'replica1234' })
];

function getNextRedisClient() {
    const client = redisReplicas[roundRobinIndex];
    roundRobinIndex = (roundRobinIndex + 1) % redisReplicas.length; // Incrementa el índice y lo resetea si es necesario
    return client;
}

// Cargar definiciones del servicio
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const serviceProto = grpc.loadPackageDefinition(packageDefinition);
const server = new grpc.Server();

// Implementación de los métodos RPC
server.addService(serviceProto.AsignaturaServicios.service, {
    ObtenerTodasAsignaturas: async (call, callback) => {
        const cacheKey = 'todas_asignaturas';
        try {
            const redisClient = getNextRedisClient(); // Obtiene el cliente de Redis siguiente en el orden
            const cachedData = await redisClient.get(cacheKey);  // Intenta leer desde la réplica seleccionada
            if (cachedData) {
                return callback(null, { asignaturas: JSON.parse(cachedData) });
            }
            const result = await postgres.query('SELECT * FROM asignatura');
            await redisMaster.set(cacheKey, JSON.stringify(result), 'EX', 600); // Escribe al maestro
            callback(null, {asignaturas: result});
        } catch (error) {
            console.error('Error:', error);
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    },
    // Otros métodos RPC...
});

// Iniciar el servidor
server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Server running at http://127.0.0.1:${port}`);
    server.start();
});
