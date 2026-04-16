import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, '../data/vehicles.json')

interface Vehicle {
  id: string
  condition_grade: number
  condition_report: string
  damage_notes: string[]
  title_status: string
  starting_bid: number
  current_bid: number
  bid_count: number
  condition_summary?: string
  [key: string]: unknown
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateSummary(client: Anthropic, vehicle: Vehicle): Promise<string> {
  const damageList = vehicle.damage_notes.length > 0
    ? vehicle.damage_notes.join('; ')
    : 'none noted'

  const prompt = `Write a 2-sentence plain English condition assessment for a vehicle at auction. Be specific about any damage.

Condition grade: ${vehicle.condition_grade}/5
Condition report: ${vehicle.condition_report}
Damage notes: ${damageList}
Title status: ${vehicle.title_status}
Starting bid: ${(vehicle.starting_bid ?? 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
Current bid: ${(vehicle.current_bid ?? 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}

Write exactly 2 sentences. Be concise and specific about the damage noted.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text.trim()
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })
  const vehicles: Vehicle[] = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
  const total = vehicles.length
  let enrichedCount = 0

  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i]
    console.log(`Processing ${i + 1} of ${total}`)

    if (vehicle.condition_summary) {
      continue
    }

    try {
      vehicle.condition_summary = await generateSummary(client, vehicle)
      enrichedCount++
    } catch (err) {
      console.error(`Skipping vehicle ${vehicle.id}: ${err instanceof Error ? err.message : err}`)
    }

    if (i < vehicles.length - 1) {
      await delay(200)
    }
  }

  writeFileSync(DATA_PATH, JSON.stringify(vehicles, null, 2))
  console.log(`Done — enriched ${enrichedCount} vehicles`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
