import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const loadEnvironment = (path) => {
  const content = readFileSync(path, 'utf8')

  for (const sourceLine of content.split(/\r?\n/u)) {
    const line = sourceLine.trim()
    if (!line || line.startsWith('#')) continue

    const separator = line.indexOf('=')
    if (separator < 1) throw new Error(`Invalid environment entry: ${sourceLine}`)

    const name = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    process.env[name] = value
  }
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    env: process.env,
    shell: true,
    stdio: 'inherit',
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}

loadEnvironment('.env.sonar')

if (!process.env.SONAR_HOST_URL || !process.env.SONAR_TOKEN) {
  throw new Error('SONAR_HOST_URL and SONAR_TOKEN are required in .env.sonar')
}

run('yarn', ['test:coverage'])
run('yarn', ['sonar'])
