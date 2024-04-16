const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Redis = require('ioredis');
const random = require('lodash.random');

const app = express();
const PORT = 3000;
app.use(express.json());

// Configuración de los clientes de Redis conectados a las réplicas
const redisClients = [
    new Redis({ port: 6380, host: 'redis-replica-uno', password: 'replica1234' }),
    new Redis({ port: 6381, host: 'redis-replica-dos', password: 'replica1234' })
];

// Selección aleatoria de un cliente Redis para cada operación de lectura
function getRandomRedisClient() {
    const index = random(0, redisClients.length - 1);
    return redisClients[index];
}

// Carga de las definiciones del servicio desde el archivo .proto
const PROTO_PATH = './services.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const asignaturaClient = new protoDescriptor.asignatura.AsignaturaServicios(
    'localhost:50051', grpc.credentials.createInsecure()
);


// Endpoint para obtener todas las asignaturas
app.get('/asignaturas', (req, res) => {
    const cacheKey = 'todas_asignaturas';
    const redisClient = getRandomRedisClient();

    redisClient.get(cacheKey, (err, data) => {
        if (err) return res.status(500).json({ error: 'Error accessing Redis' });

        if (data) {
            console.log('Cache hit:', data);
            return res.json({ asignaturas: JSON.parse(data) });
        }

        asignaturaClient.ObtenerTodasAsignaturas({}, (error, response) => {
            if (!error) {
                console.log('Data received from gRPC server:', response);
                redisClient.set(cacheKey, JSON.stringify(response), 'EX', 600);
                res.json(response);
            } else {
                console.error('Error fetching from gRPC service:', error.message);
                res.status(500).json({ error: 'Failed to fetch data from gRPC service' });
            }
        });
    });
});

// Endpoint para obtener una asignatura específica por ID
app.get('/asignaturas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const cacheKey = `asignatura_${id}`;
    const redisClient = getRandomRedisClient();

    redisClient.get(cacheKey, (err, data) => {
        if (err) return res.status(500).json({ error: 'Error accessing Redis' });

        if (data) {
            console.log('Cache hit:', data);
            return res.json({ asignatura: JSON.parse(data) });
        }

        asignaturaClient.ObtenerAsignaturaPorId({ id }, (error, response) => {
            if (!error) {
                console.log('Data received from gRPC server:', response);
                redisClient.set(cacheKey, JSON.stringify(response), 'EX', 3600);
                res.json(response);
            } else {
                console.error('Error fetching from gRPC service:', error.message);
                res.status(500).json({ error: 'Failed to fetch data from gRPC service' });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});