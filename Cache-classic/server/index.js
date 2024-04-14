const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const rpcMethods = require("./rpc-methods");

const { Pool } = require('pg');

// Crear un pool de conexiones a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',  // Asegúrate de que este host sea accesible desde donde se ejecuta tu servidor gRPC
  database: 'ramos',
  password: 'postgres',
  port: 5454,  // Puerto mapeado en Docker Compose
});

pool.connect(err => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected to postgres db');
  }
});


const Redis = require("redis");

const redisClient = Redis.createClient({
  url: "redis://default:tilines@localhost:6379",
});
redisClient.connect();

redisClient.on("error", (err) => {
  console.error("Error de Redis:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// cargar el archivo proto
const packageDefinition = protoLoader.loadSync("../../proto/res.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const myService = protoDescriptor.asignatura.AsignaturaService;

const server = new grpc.Server();
server.addService(myService.service, rpcMethods);

//iniciar servidor gRPC

const grpcPort = "50051";
server.bindAsync(
  `0.0.0.0:${grpcPort}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(`gRPC server running at http://0.0.0.0:${grpcPort}`);
    server.start();
  }
);
