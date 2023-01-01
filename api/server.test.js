// Write your tests here
const Users = require('./auth/auth-model');
const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');

describe('POST /api/auth/register', () => {
  // beforeAll(async () => {
  //   await db('users').truncate();
  // });

  const REGISTER_URL = '/api/auth/register';

  it('should insert the user into the database', async () => {
    const user = { username: 'Kitboga', password: 'abcd' };
    await request(server).post(REGISTER_URL).send(user);
    const users = await Users.getAll();
    expect(users).toHaveLength(1);
  });

  it(`should have 'id', 'username', and 'password' in response body`, async () => {
    const user = { username: 'Brian', password: 'abcd' };
    const response = await request(server).post(REGISTER_URL).send(user);
    const responseBody = JSON.parse(response.text);
    let hasFields = false;
    if (
      'id' in responseBody &&
      'username' in responseBody &&
      'password' in responseBody
    ) {
      hasFields = true;
    }
    expect(hasFields).toBe(true);
  });

  it('should hash the password', async () => {
    const user = { username: 'Alfred', password: '32fe' };
    const response = await request(server).post(REGISTER_URL).send(user);
    const responsePassword = JSON.parse(response.text).password;
    expect(user.password).not.toEqual(responsePassword);
    expect(responsePassword.length).toEqual(60);
  });

  it('throws an error if payload has missing credentials', async () => {
    const user = { username: '', password: '32fe' };
    const response = await request(server).post(REGISTER_URL).send(user);
    const responseText = JSON.parse(response.text).message;
    expect(response.status).toEqual(404);
    expect(responseText).toEqual('username and password required');
  });

  it('throws an error if username exists', async () => {
    const user = { username: 'Gigachad', password: '32fe' };
    await request(server).post(REGISTER_URL).send(user);
    const response = await request(server).post(REGISTER_URL).send(user);
    const responseText = JSON.parse(response.text).message;
    expect(response.status).toEqual(404);
    expect(responseText).toEqual('username exists');
  });
});
