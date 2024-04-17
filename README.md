# Tarea Sistemas Distribuidos 

```bash
npm i
```

```bash
docker-compose up -d

```

Server
```bash
node index.js
```

Client
```bash
node index.js
```

Docker Particion
```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis1
docker exec -it redis1 /bin/bash
redis-cli 
cluster nodes
```