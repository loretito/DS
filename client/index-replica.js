const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
const PORT = 3000;
app.use(express.json());

let cacheHits = 0;

require('dotenv').config()
const path = require('path')
const buildRedisClient = require('./service/redisClientReplica')

const redis = buildRedisClient()
// Carga de las definiciones del servicio desde el archivo .proto
const PROTO_PATH = './services.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const AsignaturaServicios = grpc.loadPackageDefinition(packageDefinition).AsignaturaServicios;
const clientService = new AsignaturaServicios(
    '127.0.0.1:50051', 
    grpc.credentials.createInsecure()
);



// Endpoint para obtener todas las asignaturas
app.get('/asignaturas', (req, res) => {
    const cacheKey = 'todas_asignaturas';

    redis.get(cacheKey, (err, data) => {
        if (err) return res.status(500).json({ error: 'Error accessing Redis' });

        if (data) {
            console.log('Cache hit:', data);
            return res.json({ asignaturas: JSON.parse(data) });
        }

        clientService.ObtenerTodasAsignaturas({}, (error, response) => {
            if (!error) {
                console.log('Data received from gRPC server:', response);
                redis.set(cacheKey, JSON.stringify(response), 'EX', 600);
                res.json(response);
            } else {
                console.error('Error fetching from gRPC service:', error.message);
                res.status(500).json({ error: 'Failed to fetch data from gRPC service' });
            }
        });
    });
});

// Endpoint para obtener una asignatura específica por ID
app.get('/asignatura/:id', async (req, res) => {
    const cacheKey = `asignatura_${req.params.id}`;
    const id = parseInt(req.params.id);  // Parse the ID to ensure it's an integer

    const cache = await redis.get(cacheKey);
    if (cache) {
        console.log('Cache hit!!');
        cacheHits++;
        res.json(JSON.parse(cache));
    } else {
        console.log('Fetching from backend!!');
        clientService.ObtenerAsignaturaPorId({ id: id }, (error, response) => {
            console.log('received item:', response);
            if (error) {
                console.error('Error fetching from gRPC service', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!response || Object.keys(response).length === 0) {
                return res.status(404).json({ message: 'Asignatura not found' });
            }
            redis.set(cacheKey, JSON.stringify(response));
            res.json(response);  // Ensure you are sending the correct part of the response
        });
    }
});

app.get('/cache-hits', (req, res) => {
    res.json({ cacheHits });
});

app.get('/uwu', async (req, res) => {
    res.json({ message: 'uwu' });
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});