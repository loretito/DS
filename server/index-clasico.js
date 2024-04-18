const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./services.proto"
var protoLoader = require("@grpc/proto-loader");
const postgres = require("./postgres.js");

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

    // Get all entries from asignatura table
    ObtenerTodasAsignaturas: async (call, callback) => {
        try {
            const result = await postgres`
            SELECT * FROM asignatura;
            `;
            callback(null, {asignaturas: result});
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                details: "Failed to fetch data"
            });
        }
    },

    // Get a single entry by ID from asignatura table
    ObtenerAsignaturaPorId: async (call, callback) => {
        try {
            const result = await postgres`
            SELECT * FROM asignatura WHERE bd_id=${parseInt(call.request.id)};
            `;

            console.log('Query result:', result);

            if (result.length > 0) {
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
    },
    
    ObtenerAsignaturaPorCodigo: async (call, callback) => {
        console.log(`Received request to fetch asignatura with codigo: ${call.request.codigo}`);
        try {
            const result = await postgres`
            SELECT * FROM asignatura WHERE codigo_asignatura=${call.request.codigo};
            `;
            console.log('Query result:', result);
            if (result.length > 0) {
                callback(null, {asignatura: result[0]});
            } else {
                console.log('No records found for the provided codigo.');
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Asignatura not found"
                });
            }
        } catch (error) {
            console.error(`Error during database query: ${error.message}`);
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
