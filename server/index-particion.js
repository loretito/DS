const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./services.proto";
var protoLoader = require("@grpc/proto-loader");
const postgres = require("../postgres.js");
const Redis = require('ioredis');

// Configuración de Redis Cluster
const redis = new Redis.Cluster([
  { port: 6379, host: '172.18.0.31' },
  { port: 6380, host: '172.18.0.32' },
  { port: 6381, host: '172.18.0.33' },
]);

// Carga de protobuf
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
        try {
            const cacheKey = 'todas_asignaturas';
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return callback(null, { asignaturas: JSON.parse(cachedData) });
            }
            const result = await postgres`
            SELECT * FROM asignatura;
            `;
            // Almacenar resultado en caché
            await redis.set(cacheKey, JSON.stringify(result), 'EX', 10); // Expira en 10 segundos
            callback(null, {asignaturas: result});
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    },

    ObtenerAsignaturaPorId: async (call, callback) => {
        try {
            const cacheKey = `asignatura_${call.request.id}`;
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return callback(null, { asignatura: JSON.parse(cachedData) });
            }
            const result = await postgres`
            SELECT * FROM asignatura WHERE bd_id=${call.request.id};
            `;
            if (result.length > 0) {
                // Almacenar resultado en caché
                await redis.set(cacheKey, JSON.stringify(result[0]), 'EX', 30); // Expira en 30 segundos
                callback(null, {asignatura: result[0]});
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Asignatura not found"
                });
            }
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    }
});

// Iniciar el servidor
server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log("Server running at http://127.0.0.1:50051");
        server.start();
    }
);
