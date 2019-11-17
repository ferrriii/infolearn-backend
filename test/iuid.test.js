import 'babel-polyfill'
import iuid from '../src/modules/iuid.js'

it('should generate unique Id', async () => {
  const ids = new Set()
  for (let i = 0; i < 100000; i++) {
    ids.add(iuid())
  }
  expect(ids.size).toBe(100000)
})

it('should generate sequential Id', async () => {
  let lastId = 0
  let newId = 0
  for (let i = 0; i < 20000; i++) {
    newId = iuid()
    expect(newId).toBeGreaterThan(lastId)
    lastId = newId
  }
})
