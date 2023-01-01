// Write your tests here
const Users = require('./auth/auth-model');
const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');
const bcrypt = require('bcryptjs');
const appTest = request(server);

const USER1 = { username: 'Barb', password: '839r2' };
const LOGIN_URL = '/api/auth/login';
const REGISTER_URL = '/api/auth/register';

afterAll(async () => {
  await db.destroy();
});
beforeEach(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

describe('User registration and authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should insert the user into the database', async () => {
      const user = { username: 'Kitboga', password: 'abcd' };
      await appTest.post(REGISTER_URL).send(user);
      const users = await Users.getAll();
      expect(users).toHaveLength(1);
    }, 2000);

    it(`should have 'id', 'username', and 'password' in response body`, async () => {
      const user = { username: 'Nairb', password: 'abcd' };
      const response = await appTest.post(REGISTER_URL).send(user);
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
    }, 750);

    it('should hash the password', async () => {
      const user = { username: 'Alfred', password: '32fe' };
      const response = await appTest.post(REGISTER_URL).send(user);
      const responsePassword = JSON.parse(response.text).password;
      expect(user.password).not.toEqual(responsePassword);
      expect(responsePassword.length).toEqual(60);
    }, 750);

    it('throws an error if payload has missing credentials', async () => {
      const user = { username: '', password: '32fe' };
      const response = await appTest.post(REGISTER_URL).send(user);
      const responseText = JSON.parse(response.text).message;
      expect(response.status).toEqual(404);
      expect(responseText).toEqual('username and password required');
    }, 750);

    it('throws an error if username exists', async () => {
      const user = { username: 'Banri', password: '32fe' };
      await request(server).post(REGISTER_URL).send(user);
      const response = await appTest.post(REGISTER_URL).send(user);
      const responseText = JSON.parse(response.text).message;
      expect(response.status).toEqual(404);
      expect(responseText).toEqual('username taken');
    }, 750);
  });

  describe('POST /api/auth/login', () => {
    it(`receives a message and token in the response body on successful login`, async () => {
      const hash = bcrypt.hashSync(USER1.password, 7);
      USER1.password = hash;
      await appTest.post(REGISTER_URL).send(USER1);
      const response = await appTest.post(LOGIN_URL).send(USER1);
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/welcome,/i);
      expect(response.body).toHaveProperty('token');
    }, 750);

    it("throws an error if user doesn't exist", async () => {
      const response = await appTest.post(LOGIN_URL).send(USER1);
      const responseText = JSON.parse(response.text).message;
      expect(responseText).toEqual('invalid credentials');
      expect(response.status).toEqual(401);
    });

    it('throws an error if password is invalid', async () => {
      await db('users').insert(USER1);
      const response = await appTest
        .post(LOGIN_URL)
        .send({ username: 'Barb', password: '*T&^GYIBH' });
      const responseText = JSON.parse(response.text).message;
      expect(responseText).toEqual('invalid credentials');
      expect(response.status).toEqual(401);
    });

    it('throws an error if payload has missing credentials', async () => {
      const user = { username: '', password: '098fe' };
      const response = await appTest.post(LOGIN_URL).send(user);
      expect(response.status).toEqual(404);
    }, 750);
  });
});
