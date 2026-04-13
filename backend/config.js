import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = process.env.DATA_DIR || '/app/data'
const CONFIG_FILE = join(DATA_DIR, 'config.json')

const DEFAULTS = {
  mealieUrl: process.env.MEALIE_URL || 'http://192.168.1.114:9000',
  mealieApiKey: process.env.MEALIE_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultServings: 4,
  members: [
    { key: 'J', name: 'Já', role: 'Administrátor' },
    { key: 'Z', name: 'Zlatěna', role: '' },
    { key: 'N', name: 'Nelča', role: '' },
  ],
}

function load() {
  try {
    if (existsSync(CONFIG_FILE)) {
      return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) }
    }
  } catch {}
  return { ...DEFAULTS }
}

function save(data) {
  mkdirSync(DATA_DIR, { recursive: true })
  // Never persist env-var-sourced keys if they weren't explicitly set via UI
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2))
}

export function getConfig() {
  return load()
}

export function updateConfig(patch) {
  const current = load()
  const next = { ...current, ...patch }
  save(next)
  return next
}
