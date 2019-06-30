const express = require('express')
const path = require('path')
const app = express()

const phpExpress = require('php-express')({
  binPath: 'php' // assumes php is in your PATH
})

app.use('/css', express.static(path.join(__dirname, 'build/css')))
app.use('/images', express.static(path.join(__dirname, 'build/images')))
app.use('/javascript', express.static(path.join(__dirname, 'build/javascript')))
app.get('/views/rsvp.php', renderRSVP)
app.get('/views/playlist.php', renderPlaylist)
app.get('/views/pledge-manager.php', renderPledgeManager)
app.get('/*', render)
app.post('/*', render)

function render(req, res) {
  phpExpress.engine(path.join(__dirname, 'build/views/render.php'), {
    method: req.method,
    get: req.query,
    post: req.body,
    server: {
      REQUEST_URI: req.url,
      HTTPS: true
    }
  }, (err, body) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(body)
    }
  })
}

function renderRSVP(req, res) {
  phpExpress.engine(path.join(__dirname, 'build/views/rsvp.php'), {
    method: req.method,
    get: req.query,
    post: req.body,
    server: {
      REQUEST_URI: req.url,
      HTTPS: true
    }
  }, (err, body) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(body)
    }
  })
}

function renderPlaylist(req, res) {
  phpExpress.engine(path.join(__dirname, 'build/views/playlist.php'), {
    method: req.method,
    get: req.query,
    post: req.body,
    server: {
      REQUEST_URI: req.url,
      HTTPS: true
    }
  }, (err, body) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(body)
    }
  })
}

function renderPledgeManager(req, res) {
  console.log('Render pledge manager', req.header('Access-Token'))
  phpExpress.engine(path.join(__dirname, 'build/views/pledge-manager.php'), {
    method: req.method,
    get: req.query,
    post: req.body,
    server: {
      REQUEST_URI: req.url,
      HTTPS: true,
      HTTP_REFERER: 'local-dev-server',
      ACCESS_TOKEN: req.header('Access-Token')
    }
  }, (err, body) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(body)
    }
  })
}

const server = app.listen(9750, function () {
  const port = server.address().port
  console.log('Wedding Website server listening at http://%s:%s/', 'localhost', port);
})
