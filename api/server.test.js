// Write your tests here
const Users = require('./auth/auth-model');
const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await db('users').where({ id: 2 }).del();
  });

  const REGISTER_URL = '/api/auth/register';

  it('successfully inserts the user into the database', async () => {
    const user = { username: 'Kitboga', password: 'abcd' };
    await request(server).post(REGISTER_URL).send(user);
    const users = await Users.getAll();
    expect(users).toHaveLength(2);
  });

  it('throws an error if payload has missing credentials', async () => {
    const user = { username: '', password: '32fe' };
    const response = await request(server).post(REGISTER_URL).send(user);
    const responseText = JSON.parse(response.text).message;
    expect(response.status).toEqual(404);
    expect(responseText).toEqual('username and password required');
  });

  it('throws an error if username exists', async () => {
    const user = { username: 'Kitboga', password: '32fe' };
    await request(server).post(REGISTER_URL).send(user);
    const response = await request(server).post(REGISTER_URL).send(user);
    const responseText = JSON.parse(response.text).message;
    expect(response.status).toEqual(404);
    expect(responseText).toEqual('username exists');
  });
});
