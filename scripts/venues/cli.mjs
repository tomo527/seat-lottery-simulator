export const parseArgs = (args, allowed) => {
  const result = {}
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`)
    const key = token.slice(2)
    if (!allowed.has(key)) throw new Error(`Unknown option: --${key}`)
    if (result[key] !== undefined) throw new Error(`Duplicate option: --${key}`)
    if (allowed.get(key) === 'boolean') result[key] = true
    else {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for --${key}`)
      result[key] = value
      index += 1
    }
  }
  return result
}

export const requireArgs = (args, names) => {
  const missing = names.filter((name) => typeof args[name] !== 'string' || !args[name].trim())
  if (missing.length) throw new Error(`Missing required option(s): ${missing.map((name) => `--${name}`).join(', ')}`)
}
