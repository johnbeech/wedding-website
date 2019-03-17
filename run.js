const path = require('path')
const { find } = require('promise-path')
const report = (...messages) => console.log('[Run]', ...messages)

const scriptToRun = process.argv[2] || false

async function start () {
  const scriptPaths = await find(path.join(__dirname, 'scripts/*.js'))
  const scriptNames = scriptPaths.map(n => n.match(/scripts\/([a-z-]+)\.js/)[1])
  const scripts = scriptNames.reduce((acc, n) => {
    acc[n] = require(`./scripts/${n}`)
    return acc
  }, {})

  function runScriptIfFunction (n) {
    if (typeof scripts[n] === 'function') {
      return scripts[n]()
    } else {
      return report('Script', n, 'is not a function')
    }
  }

  scripts.all = async () => {
    return processScripts([
      'build-website'
    ], scripts)
  }

  async function processScripts (scriptsToRun, scriptIndex) {
    let nextScript
    const remainingScripts = [].concat(...scriptsToRun)
    try {
      const results = []
      while (remainingScripts.length > 0) {
        nextScript = remainingScripts.shift()
        const result = await scriptIndex[nextScript]()
        results.push(result)
      }
    } catch (ex) {
      report('Process scripts:', scriptsToRun, 'Remaining:', remainingScripts, 'running:', nextScript)
      throw ex
    }
  }

  if (scripts[scriptToRun]) {
    report('Running', scriptToRun)
    await runScriptIfFunction(scriptToRun)
  } else {
    report('Available scripts to run:')
    Object.keys(scripts).sort().forEach(n => console.log(' ', `node run ${n}`))
  }
}

start()
