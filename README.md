# Tarea 1 Sistemas Distribuidos 

Autors: César Muñoz y Loreto Ñancucheo


### Stack
![Static Badge](https://img.shields.io/badge/gRPC-5CAFB5?style=for-the-badge&logoColor=%23FF0000&link=https%3A%2F%2Fgrpc.io%2Fdocs%2F)
![Static Badge](https://img.shields.io/badge/docker-0F3486?style=for-the-badge&logo=docker&link=https%3A%2F%2Fdocs.docker.com%2F)
![Static Badge](https://img.shields.io/badge/Postgresql-6395BF?style=for-the-badge&logo=postgresql&logoColor=%23ffffff&link=https%3A%2F%2Fwww.postgresql.org%2Fdocs%2F)

![Static Badge](https://img.shields.io/badge/Redis-FF8787?style=for-the-badge&logo=redis&logoColor=%23FF0000&link=https%3A%2F%2Fredis.io%2Fdocs%2Flatest%2F)
![Static Badge](https://img.shields.io/badge/Python-265075?style=for-the-badge&logo=python&logoColor=%23ffffff&link=https%3A%2F%2Fwww.python.org%2Fdoc%2F)
![Static Badge](https://img.shields.io/badge/Express-222222?style=for-the-badge&logo=express&link=https%3A%2F%2Fexpressjs.com%2F)
![Static Badge](https://img.shields.io/badge/javascript-222222?style=for-the-badge&logo=javascript&link=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FJavaScript)



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
