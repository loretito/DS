const Redis = require("redis");
const redisClient = Redis.createClient({
  url: "redis://default:tilines@localhost:6379",
});

redisClient.connect();

redisClient.on("error", (err) => {
  console.error("Error de Redis:", err);
});

const List = (_, callback) => {
  redisClient.get("data", (err, reply) => {
    if (err) {
      console.error("Error al obtener datos de Redis:", err);
      callback({ code: grpc.status.INTERNAL, message: "Error de servidor" });
    } else if (reply) {
      const data = JSON.parse(reply);
      callback(null, { items: data });
    } else {
      // Si los datos no están en el cache, realizar alguna operación para obtenerlos
      // y luego almacenarlos en Redis antes de devolverlos
      const newData = obtenerDatosDeAlgunaFuente();
      redisClient.set("data", JSON.stringify(newData));
      callback(null, { items: newData });
    }
  });
};

const Get = (call, callback) => {
    const codigo = call.request.codigo;
    const key = `asignatura:${codigo}`;
  
    // Intenta obtener la asignatura desde Redis primero
    redisClient.get(key, async (err, reply) => {
      if (err) {
        console.error("Redis Error:", err);
        callback({
          code: grpc.status.INTERNAL,
          message: "Internal server error",
        });
      } else if (reply) {
        // Si la asignatura está en Redis, devuélvela
        const asignatura = JSON.parse(reply);
        callback(null, { asignatura });
      } else {
        // Si no está en Redis, consulta la base de datos
        try {
          const res = await pool.query('SELECT * FROM asignaturas WHERE codigo = $1', [codigo]);
          if (res.rows.length > 0) {
            const asignatura = res.rows[0];
            // Almacena el resultado en Redis antes de devolverlo
            redisClient.setex(key, 3600, JSON.stringify(asignatura));
            callback(null, { asignatura });
          } else {
            callback({
              code: grpc.status.NOT_FOUND,
              message: "Asignatura not found",
            });
          }
        } catch (dbErr) {
          console.error("Database Error:", dbErr);
          callback({
            code: grpc.status.INTERNAL,
            message: "Failed to access database",
          });
        }
      }
    });
  };
  



module.exports = {
  List,
  Get,
};
