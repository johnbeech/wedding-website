const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')

let server = express()
const httpPort = 9750

server.use(cors())
server.use('/', express.static(path.join(__dirname, 'build')))

http.createServer(server).listen(httpPort, () => {
    console.log(`Wedding Website listening on http://localhost:${httpPort}/`)
})
