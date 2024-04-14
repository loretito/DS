const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});

const rpcMethods = require("../server/rpc-methods");
const Redis = require("redis");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Inicializa el cliente de Redis
const redisClient = Redis.createClient({
  url: "redis://default:tilines@localhost:6379",
});
redisClient.connect();

// Inicializa el cliente gRPC
const protoDefinition = protoLoader.loadSync("../../proto/res.proto", {
  /* opciones */
});
const grpcObject = grpc.loadPackageDefinition(protoDefinition);
const grpcClient = new grpcObject.asignatura.AsignaturaService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Middleware para verificar el cache antes de proceder a la lógica del negocio
app.use("/api/:key", (req, res, next) => {
  const key = req.params.key;
  redisClient.get(key, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(data);
    } else {
      next();
    }
  });
});

// Ruta de ejemplo que utiliza gRPC y Redis
app.get("/api/:key", (req, res) => {
  const key = req.params.key;
  grpcClient.someMethod({ key: key }, (error, grpcResponse) => {
    if (!error) {
      redisClient.setex(key, 3600, JSON.stringify(grpcResponse)); // Guarda la respuesta en Redis por 1 hora
      res.json(grpcResponse);
    } else {
      res.status(500).json({ error: "Error al recuperar datos" });
    }
  });
});


app.get("/api/asignaturas/:codigo", (req, res) => {
    const codigo = req.params.codigo;
    console.log(`Inicio de la solicitud gRPC para el código: ${codigo}`);
    const start = Date.now();

    grpcClient.Get({ codigo: codigo }, (error, grpcResponse) => {
        const duration = Date.now() - start;
        console.log(`gRPC solicitado en ${duration} ms`);

        if (!error) {
            res.json(grpcResponse);
        } else {
            res.status(500).json({ error: "Error al recuperar datos" });
        }
    });
});


app.get("/uwu", (req, res) => {
    res.status(200).json({ message: "uwu" });
});
