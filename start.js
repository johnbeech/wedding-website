const { run } = require('promise-path')

async function start() {
  await run('node run build-website')
  require('./server')
}

start()
