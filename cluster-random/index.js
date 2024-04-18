require('dotenv').config()
const path = require('path')
const buildRedisClient = require('../client/service/redisClient')
// Aqui van las otras dependencias como express y esas

const redis = buildRedisClient()

// Aqui va el resto del código

//example of end point

app.post('/save-data', async (request, response) => {
    const { key, value } = request.body
    await redis.set(key, value)
    return response.status(201).render('home/index', {
      layout: 'default',
      dataSaved: true,
    })
  })

