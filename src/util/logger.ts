import config from '../config'

function info(...args: any[]): void {
  if (config.verbose) {
    console.info(...args)
  }
}

function warn(...args: any[]): void {
  if (config.verbose) {
    console.warn(...args)
  }
}

function error(...args: any[]): void {
  console.error(...args)
}

export default {
  info,
  warn,
  error,
}
