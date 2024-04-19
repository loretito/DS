# Tarea 1 Sistemas Distribuidos 

Autors: Cesar Muñoz y Loreto Ñancucheo

### Setup
In both the server and client directories, run:

```bash
npm i
```

#### Docker
To bring up Docker Compose (depending on the caching method), use:
```bash
docker-compose up -d
```

To bring down Docker Compose
```bash
docker-compose down -v
```

#### Server

For server operations:

```bash
npm run start
```

#### Client

For client operations, you have three options:

```bash
# to use clasic cache
npm run start-clasic

# to use partition cache
npm run start-partition

# to use replica cache
npm run start-replica
```
    
<!-- #### Docker Partition

To inspect the Docker network and access Redis:

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis1
docker exec -it redis1 /bin/bash
redis-cli 
cluster nodes
``` -->

### Testing
In test directory, for uniform test:
```python
python3 uniform-test.py
```

for the entropy test: 
```python
python3 entropy-test.py
```

### Miscellaneous

In case db-init is missing permissions:

```bash
sudo setenforce 0
sudo chcon -Rt svirt_sandbox_file_t ./db-init/
```

If subnet 173.18.0.0/16 is occupied:

```bash
sudo docker network ls

sudo docker network inspect [network_name]

sudo docker network rm [network_name]

```