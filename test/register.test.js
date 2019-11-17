import 'babel-polyfill'
import request from 'supertest'
import app from '../src/api.js'
import db from './initlaizedb.js'

beforeAll(() => {
  return db.initialize()
})

afterAll(() => {
  return db.clear()
})

it('should create a new user', async () => {
  const res = await request(app)
    .post('/register')
    .send({
      deviceId: 1
    })
  expect(res.statusCode).toEqual(200)
  expect(res.body).toHaveProperty('data.token')
})

it('should fail with deviceId:0', async () => {
  const res = await request(app)
    .post('/register')
    .send({
      deviceId: 0
    })
  expect(res.statusCode).not.toEqual(200)
  expect(res.body).toHaveProperty('error')
})

it('should fail with negative deviceId', async () => {
  const res = await request(app)
    .post('/register')
    .send({
      deviceId: -1
    })
  expect(res.statusCode).not.toEqual(200)
  expect(res.body).toHaveProperty('error')
})

it('should fail with string deviceId', async () => {
  const res = await request(app)
    .post('/register')
    .send({
      deviceId: '+1string'
    })
  expect(res.statusCode).not.toEqual(200)
  expect(res.body).toHaveProperty('error')
})

it('should fail with no deviceId', async () => {
  const res = await request(app)
    .post('/register')
    .send({})
  expect(res.statusCode).not.toEqual(200)
  expect(res.body).toHaveProperty('error')
})
