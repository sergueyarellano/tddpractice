const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3010

app.use(bodyParser.json())
app.get('/data', (req, res) => {
  const data = [
    {
      type: 'store',
      class: 'dog',
      report: 'Nice dog store in downtown Toronto',
      address: '203 King street West',
      range: 100
    },
    {
      type: 'store',
      class: 'cat',
      report: 'Nice cat store in downtown Toronto',
      address: '200 Wellington street West',
      range: 50
    },
    {
      type: 'store',
      class: 'dog',
      report: 'Nice alternative dog store in downtown Toronto',
      address: '203 King street West',
      range: 220
    },
    {
      type: 'store',
      class: 'barber shop',
      report: 'Nice barber shop downtown Toronto',
      address: '20 King street West',
      range: 10
    }
  ]
  res.json(data)
})

app.listen(port, () => console.log(`stub magic happens on port ${port}`))
