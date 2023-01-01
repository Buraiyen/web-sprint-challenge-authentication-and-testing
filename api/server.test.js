// Write your tests here
const Users = require('./auth/auth-model');
const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await db('users').where({ id: 2 }).del();
  });
  it('throws an error with missing credentials', async () => {
    const user = { username: '', password: '32fe' };
    // await Users.insert(user);
    const response = await request(server)
      .post('/api/auth/register')
      .send(user);
    const responseText = JSON.parse(response.text).message;
    expect(response.status).toEqual(404);
    expect(responseText).toEqual('username and password required');
  });
});
