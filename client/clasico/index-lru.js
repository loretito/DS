const express = require('express');
const { client1 } = require('../redis/redis');  
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './services.proto';

const app = express();
const PORT = 3000;

// Load and define the gRPC service
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const AsignaturaServicios = grpc.loadPackageDefinition(packageDefinition).AsignaturaServicios;

// Create a new gRPC client
const clientService = new AsignaturaServicios(
    '127.0.0.1:50051',  // Ensure this is the correct address for the gRPC server
    grpc.credentials.createInsecure()  // Only for development, consider secure options for production
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Endpoint to get all asignaturas
app.get('/asignaturas', async (req, res) => {
    const cacheKey = 'asignaturas_all';
    const cache = await client1.get(cacheKey);

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
            client1.set(cacheKey, data, 'EX', 3600); // Set cache with a 1-hour expiration
            res.json(items);
        });
    }
});

// Endpoint to get a specific asignatura by ID
app.get('/asignatura/:id', async (req, res) => {
    const cacheKey = `asignatura_${req.params.id}`;
    const cache = await client1.get(cacheKey);

    if (cache) {
        console.log('Cache hit!!');
        res.json(JSON.parse(cache));
    } else {
        console.log('Fetching from backend!!');
        clientService.ObtenerAsignaturaPorId({ id: parseInt(req.params.id) }, (error, item) => {
            if (error) {
                console.error('Error fetching from gRPC service', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            const data = JSON.stringify(item);
            client1.set(cacheKey, data, 'EX', 3600); // Set cache with a 1-hour expiration
            res.json(item);
        });
    }
});

app.get('/uwu', async (req, res) => {
    res.json({ message: 'uwu' });
})