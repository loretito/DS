# Tarea Sistemas Distribuidos 

## Setup
In both the server and client directories, run:

```bash
npm i
```

To bring up Docker Compose (depending on the caching method), use:
```bash
docker-compose -f < docker-compose-file-name.yml > up -d
docker-compose -f < docker-compose-file-name.yml > down
```

To bring down Docker Compose
```bash
docker-compose -f < docker-compose-file-name.yml > down
```

### Server

For server operations, you have three options:

```bash
# to use clasic cache
npm run start-clasic

# to use partition cache
npm run start-partition

# to use replica cache
npm run start-replica
```

### Client

For server operations, you have three options:

```bash
# to use clasic cache
npm run start-clasic

# to use partition cache
npm run start-partition

# to use replica cache
npm run start-replica
```

### Docker Partition

To inspect the Docker network and access Redis:

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis1
docker exec -it redis1 /bin/bash
redis-cli 
cluster nodes
```