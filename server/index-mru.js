const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./services.proto";
var protoLoader = require("@grpc/proto-loader");
const postgres = require("./postgres.js");
const redis = require("redis");
const client = redis.createClient({
  password: 'master1234'  // Asegúrate de usar la contraseña correcta para tu instancia de Redis
});

client.connect();

// Load your protobuf
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const serviceProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// Implementation of the RPC methods
server.addService(serviceProto.AsignaturaServicios.service, {
    ObtenerTodasAsignaturas: async (call, callback) => {
        try {
            const cacheKey = 'all_asignaturas';
            const cachedData = await client.get(cacheKey);
            if (cachedData) {
                console.log("Returning data from cache");
                callback(null, { asignaturas: JSON.parse(cachedData) });
            } else {
                const result = await postgres`
                SELECT * FROM asignatura;
                `;
                await client.set(cacheKey, JSON.stringify(result));
                await client.zAdd('mru_index', { score: Date.now(), value: cacheKey });
                callback(null, { asignaturas: result });
            }
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    },

    ObtenerAsignaturaPorId: async (call, callback) => {
        const id = call.request.id;
        const cacheKey = `asignatura:${id}`;
        try {
            const cachedData = await client.get(cacheKey);
            if (cachedData) {
                console.log("Returning data from cache");
                await client.zAdd('mru_index', { score: Date.now(), value: cacheKey });
                callback(null, { asignatura: JSON.parse(cachedData) });
            } else {
                const result = await postgres`
                SELECT * FROM asignatura WHERE bd_id=${id};
                `;
                if (result.length > 0) {
                    await client.set(cacheKey, JSON.stringify(result[0]));
                    await client.zAdd('mru_index', { score: Date.now(), value: cacheKey });
                    callback(null, { asignatura: result[0] });
                } else {
                    callback({
                        code: grpc.status.NOT_FOUND,
                        details: "Asignatura not found"
                    });
                }
            }
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    }
});

// Start the server
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
