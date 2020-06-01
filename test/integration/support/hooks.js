const { BeforeAll, AfterAll } = require('cucumber')
const spawn = require('child_process').spawn
const path = require('path')
const processes = []

BeforeAll(async function () {
  processes.push(await runServer('app'))
  processes.push(await runServer('stub'))
})

AfterAll(async () => Promise.all(processes.map(process => killProcess(process))))

function runServer (name) {
  const available = {
    app: {
      command: 'node',
      args: [path.resolve(__dirname, '../../../app/server.js')],
      regex: /app magic happens on port/
    },
    stub: {
      command: 'node',
      args: [path.resolve(__dirname, '../../mocks/stub.js')],
      regex: /stub magic happens on port/
    }
  }
  const server = available[name]
  return new Promise((resolve, reject) => {
    const ps = spawn(server.command, server.args)
    ps.stdout.on('data', processOutput => {
      const output = processOutput.toString()
      console.log(output)
      server.regex.test(output) && resolve({ ps, name })
    })
  })
}

function killProcess (child) {
  return new Promise((resolve) => {
    child.ps.kill()
    child.ps.on('exit', (code, signal) => {
      console.log('\nprocess terminated:', child.name)
      resolve(code)
    })
  })
}
