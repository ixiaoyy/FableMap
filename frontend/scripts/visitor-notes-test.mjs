import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const taverns = readFileSync(new URL('../app/lib/taverns.ts', import.meta.url), 'utf8')
const route = readFileSync(new URL('../app/routes/tavern.tsx', import.meta.url), 'utf8')

assert(taverns.includes('/visitor-notes'), 'visitor note service should use /visitor-notes endpoints')
assert(taverns.includes('createVisitorNote'), 'createVisitorNote helper should exist')
assert(taverns.includes('listVisitorNotes'), 'listVisitorNotes helper should exist')
assert(taverns.includes('deleteVisitorNote'), 'deleteVisitorNote helper should exist')
assert(route.includes('这不是公开留言墙'), 'visitor note UI should state this is not a public wall')
assert(route.includes('createVisitorNote'), 'tavern route should submit visitor notes through service helper')
assert(!route.includes('TavernMessageBoard'), 'tavern route should not render public message board')

console.log('visitor-notes frontend contract ok')