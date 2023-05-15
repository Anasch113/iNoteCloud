const connectToMongo = require('./db');
connectToMongo();
var cors = require('cors')
const express = require('express')
const app = express()
const port = 5000
const path = require('path')


app.use(cors())

app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

//Static files
app.use(express.static(path.join(__dirname, "./build")))
app.get('*', function(req,res){
  res.sendFile(path.join(__dirname, "./build/index.html"))
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



