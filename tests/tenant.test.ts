import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canAddNoteOnFree, canInviteOnFree, isLastAdmin } from '../src/lib/plans'
import { slugify } from '../src/lib/tenant'

test('free plan blocks a fourth seat', () => {
  assert.equal(canInviteOnFree(2), true)
  assert.equal(canInviteOnFree(3), false)
})

test('slugify keeps a company wall name clean', () => {
  assert.equal(slugify('Atelier Cascais'), 'atelier-cascais')
})

test('free ledger stops at eight sheets', () => {
  assert.equal(canAddNoteOnFree(7), true)
  assert.equal(canAddNoteOnFree(8), false)
})

test('the last admin stays on the wall', () => {
  assert.equal(isLastAdmin([{ role: 'admin', userId: 'a' }, { role: 'member', userId: 'b' }], 'a'), true)
  assert.equal(isLastAdmin([{ role: 'admin', userId: 'a' }, { role: 'admin', userId: 'c' }], 'a'), false)
})
