--asignatura|nombre|seccion|evento|horario|profesor|sede|paquete
--CIG1002|INGLÉS GENERAL II|Sección 1|VACANTES CARRERA INGLÉS 01|LU MI 08:30 - 09:50|PALOMINOS MARCELA CATALINA|S-SANTIAGO|CIG1002_VC01
--CIG1002|INGLÉS GENERAL II|Sección 10|VACANTES CARRERA INGLES 10|MI VI 14:30 - 15:50|MOYANO NATALY DEL SOL|S-SANTIAGO|CIG1002_VC10
--CIG1002|INGLÉS GENERAL II|Sección 11|VACANTES CARRERA INGLES 11|LU MI 08:30 - 09:50|DINAMARCA OLGA MARGARITA|S-SANTIAGO|CIG1002_VC11

CREATE DATABASE IF NOT EXISTS ramos;
\c ramos

CREATE TABLE asignatura (
    bd_id SERIAL PRIMARY KEY,
    codigo_asignatura VARCHAR(15),
    nombre_asignatura VARCHAR(255),
    seccion VARCHAR(15),
    evento VARCHAR(255),
    horario VARCHAR(255),
    profesor VARCHAR(255),
    sede VARCHAR(255),
    paquete VARCHAR(255)
);

COPY asignatura(codigo_asignatura, nombre_asignatura, seccion, evento, horario, profesor, sede, paquete) 
FROM '/docker-entrypoint-initdb.d/02-ramos.txt' DELIMITER '|' CSV HEADER;
