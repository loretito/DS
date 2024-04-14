const Redis = require("redis");

const redisClients = [
  Redis.createClient({ url: "redis://localhost:6379" }),
  Redis.createClient({ url: "redis://localhost:6380" }),
  Redis.createClient({ url: "redis://localhost:6381" }),
];

redisClients.forEach((client) => {
  client.connect();
  client.on("error", (err) => {
    console.error("Error with Redis client:", err);
  });
});

function getRedisClient(key) {
  // Simple hash function to distribute keys
  let index = hashCode(key) % redisClients.length;
  return redisClients[index];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const server = new grpc.Server();
server.addService(myService.ResService.service, {
  List: (_, callback) => {
    const client = getRedisClient("data");
    client.get("data", (err, reply) => {
      if (err) {
        console.error("Error al obtener datos de Redis:", err);
        callback({ code: grpc.status.INTERNAL, message: "Error de servidor" });
      } else if (reply) {
        const data = JSON.parse(reply);
        callback(null, { items: data });
      } else {
        const newData = obtenerDatosDeAlgunaFuente();
        client.set("data", JSON.stringify(newData), "EX", 3600); // Set with expiration as needed
        callback(null, { items: newData });
      }
    });
  },
  Get: (call, callback) => {
    const codigo = call.request.codigo;
    const key = `asignatura:${codigo}`;
    const client = getRedisClient(key);

    client.get(key, (err, reply) => {
      if (err) {
        console.error("Redis Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Internal server error",
        });
      } else if (reply) {
        const asignatura = JSON.parse(reply);
        callback(null, { asignatura });
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Asignatura not found",
        });
      }
    });
  },
  Create: (call, callback) => {
    const asignatura = call.request;
    const key = `asignatura:${asignatura.codigo}`;
    const client = getRedisClient(key);

    client.get(key, (err, reply) => {
      if (err) {
        console.error("Redis Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Internal server error",
        });
      } else if (reply) {
        callback({
          code: grpc.status.ALREADY_EXISTS,
          message: "Asignatura already exists",
        });
      } else {
        client.set(key, JSON.stringify(asignatura), (setErr, setReply) => {
          if (setErr) {
            console.error("Redis Error on Create:", setErr);
            callback({
              code: grpc.status.INTERNAL,
              message: "Failed to create Asignatura",
            });
          } else {
            callback(null, { asignatura });
          }
        });
      }
    });
  },
  Insert: (call, callback) => {
    const asignatura = call.request.asignatura; // Make sure to properly handle the data structure.
    const key = `asignatura:${asignatura.codigo}`;
    const client = getRedisClient(key);

    client.set(key, JSON.stringify(asignatura), (err, reply) => {
      if (err) {
        console.error("Redis Error on Insert:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Failed to insert Asignatura",
        });
      } else {
        callback(null, { success: true });
      }
    });
  },
  Update: (call, callback) => {
    const asignatura = call.request;
    const key = `asignatura:${asignatura.codigo}`;
    const client = getRedisClient(key);

    client.get(key, (err, reply) => {
      if (err) {
        console.error("Redis Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Internal server error",
        });
      } else if (reply) {
        client.set(key, JSON.stringify(asignatura), (setErr, setReply) => {
          if (setErr) {
            console.error("Redis Error on Update:", setErr);
            callback({
              code: grpc.status.INTERNAL,
              message: "Failed to update Asignatura",
            });
          } else {
            callback(null, { asignatura });
          }
        });
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Asignatura not found",
        });
      }
    });
  },
  Delete: (call, callback) => {
    const codigo = call.request.codigo;
    const key = `asignatura:${codigo}`;
    const client = getRedisClient(key);

    client.del(key, (err, reply) => {
      if (err) {
        console.error("Redis Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Internal server error",
        });
      } else if (reply === 1) {
        // Redis returns 1 if the key was deleted
        callback(null, {});
      } else {
        callback({
          code: grpc.status.NOT_FOUND,
          message: "Asignatura not found",
        });
      }
    });
  },
});

const grpcPort = "50051";
server.bindAsync(
  `0.0.0.0:${grpcPort}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(`gRPC server running at http://0.0.0.0:${grpcPort}`);
    server.start();
  }
);

const httpPort = 3000;
app.listen(httpPort, () => {
  console.log(`HTTP server running at http://localhost:${httpPort}`);
});
