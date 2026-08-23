import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canInviteOnFree } from '../src/lib/plans'
import { slugify } from '../src/lib/tenant'

test('free plan blocks a fourth seat', () => {
  assert.equal(canInviteOnFree(2), true)
  assert.equal(canInviteOnFree(3), false)
})

test('slugify keeps a company wall name clean', () => {
  assert.equal(slugify('Atelier Cascais'), 'atelier-cascais')
})
