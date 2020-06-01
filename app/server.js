const express = require('express')
const { pipe, lift, composeRequest, mapResponse, createResult, filterResponse } = require('./tools')
const { makeRequest } = require('./network')
const app = express()
const port = process.env.PORT || 3000

app.get('/stores', async (req, res) => {
  const config = {
    host: 'http://localhost:3010',
    endpoint: 'data',
    method: 'GET',
    headers: { 'content-type': 'application/json' },
    contract: {
      type: 'class',
      description: 'report',
      location: 'address',
      distance: 'range'
    },
    filters: [
      (element) => element.distance < 200
    ]
  }
  const { result } = await pipe(
    composeRequest,
    makeRequest,
    mapResponse,
    filterResponse,
    createResult
  )(lift(config))

  res.json(result)
})

app.listen(port, () => console.log(`app magic happens on port ${port}`))
