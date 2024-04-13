const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cargar el archivo proto
const packageDefinition = protoLoader.loadSync('../proto/res.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const myService = protoDescriptor.res;

// Crear un cliente gRPC
const client = new myService.ResService('localhost:50051', grpc.credentials.createInsecure());

// Método para obtener la lista de asignaturas desde el servidor
function obtenerListaDeAsignaturas() {
    return new Promise((resolve, reject) => {
        client.List({}, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.items);
            }
        });
    });
}

// Método para obtener una asignatura por su código desde el servidor
function obtenerAsignaturaPorCodigo(codigo) {
    return new Promise((resolve, reject) => {
        client.Get({ codigo }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.asignatura);
            }
        });
    });
}

// Método para insertar una asignatura en el servidor
function insertarAsignatura(asignatura) {
    return new Promise((resolve, reject) => {
        client.Insert({ asignatura }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.success);
            }
        });
    });
}

// Método para actualizar una asignatura en el servidor
function actualizarAsignatura(asignatura) {
    return new Promise((resolve, reject) => {
        client.Update({ asignatura }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.success);
            }
        });
    });
}

// Método para eliminar una asignatura por su código en el servidor
function eliminarAsignaturaPorCodigo(codigo) {
    return new Promise((resolve, reject) => {
        client.Delete({ codigo }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.success);
            }
        });
    });
}

// Ejemplo de uso
async function main() {
    try {
        // Obtener la lista de asignaturas
        const asignaturas = await obtenerListaDeAsignaturas();
        console.log('Lista de asignaturas:', asignaturas);

        // Obtener una asignatura por su código
        const asignatura = await obtenerAsignaturaPorCodigo('CIG1002');
        console.log('Asignatura por código:', asignatura);

        // Insertar una nueva asignatura
        const nuevaAsignatura = { codigo: 'NUEVA001', nombre: 'Nueva Asignatura', seccion: 'Sección 1' };
        const insercionExitosa = await insertarAsignatura(nuevaAsignatura);
        console.log('Inserción exitosa:', insercionExitosa);

        // Actualizar una asignatura existente
        const asignaturaActualizada = { codigo: 'CIG1002', nombre: 'Inglés General II Modificado', seccion: 'Sección 10' };
        const actualizacionExitosa = await actualizarAsignatura(asignaturaActualizada);
        console.log('Actualización exitosa:', actualizacionExitosa);

        // Eliminar una asignatura por su código
        const eliminacionExitosa = await eliminarAsignaturaPorCodigo('NUEVA001');
        console.log('Eliminación exitosa:', eliminacionExitosa);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
