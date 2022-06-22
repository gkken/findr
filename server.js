const express = require('express')
const app = express()
const { Pool } = require('pg')
const port = 8080

db = new Pool({
  user: 'postgres',
  database: 'findr', //change back to test1
  password: '' //remove this
})

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/api/owners/total', (req, res) => {
  const sql = `SELECT owner, count(*) FROM petrol_stations GROUP BY owner;`
  db.query(sql).then(dbRes => res.json(dbRes.rows))
})

app.get('/api/stations/all', (req, res) => {
  let sql = 'SELECT * FROM petrol_stations;'
  db.query(sql).then(dbRes => res.json(dbRes.rows))
})

app.listen(port)