import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activityCsv } from '../src/lib/export'
import { initials } from '../src/lib/hue'
import { canAddNoteOnFree, canInviteOnFree, canRecordJobOnFree, isLastAdmin } from '../src/lib/plans'
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

test('free jobs stop at forty in the window', () => {
  assert.equal(canRecordJobOnFree(39), true)
  assert.equal(canRecordJobOnFree(40), false)
})

test('activity export keeps one line per event', () => {
  const csv = activityCsv(
    [{ createdAt: '2026-08-24', kind: 'note', message: 'Folha', messageEn: 'Sheet' }],
    'pt',
  )
  assert.match(csv, /Folha/)
})

test('initials take two letters', () => {
  assert.equal(initials('David Martins'), 'DM')
})
