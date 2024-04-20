const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './services.proto';

require('dotenv').config()
const path = require('path')
const buildRedisClient = require('./service/redisClientCluster')

const redis = buildRedisClient()

const app = express();
const PORT = 3000;

let cacheHits = 0;

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/asignaturas', async (req, res) => {
    const cacheKey = 'asignaturas_all';
    const cache = await redis.get(cacheKey);

    if (cache) {
        console.log('Cache hit!!');
        res.json(JSON.parse(cache));
    } else {
        console.log('Fetching from backend!!');
        clientService.ObtenerTodasAsignaturas(null, (error, items) => {
            if (error) {
                console.error('Error fetching from gRPC service', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            const data = JSON.stringify(items);
            redis.set(cacheKey, data); 
            res.json(items);
        });
    }
});

app.get('/asignatura/:id', async (req, res) => {
    const cacheKey = `asignatura_${req.params.id}`;
    const id = parseInt(req.params.id);  

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
            res.json(response);  
        });
    }
});

app.get('/cache-hits', (req, res) => {
    res.json({ cacheHits });
});

app.get('/uwu', async (req, res) => {
    res.json({ message: 'uwu' });
})