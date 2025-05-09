import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { UserModel } from '../../model/UserModel';
import { UserService } from '../../service/UserService';

let mongoServer = new MongoMemoryServer();
const userService = new UserService();
const {app} = require('../app');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri: string = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe('Testing getUser', () => {
  it('should get a user from id', async () => {
    const newUser = {
      _id: "1234",
      username: "user123",
      firebaseToken: "user12345"
    };

    await userService.createUser(newUser._id, newUser.username, newUser.firebaseToken)

    const response = await request(app)
        .get(`/user/${newUser._id}`)
        .expect(200)

    expect(response.body).toHaveProperty('_id');
    expect(response.body._id).toBe(newUser._id);
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.firebaseToken).toStrictEqual([newUser.firebaseToken]);
  });

  it('should fail to get user from id from request with an invalid parameter', async () => {
    await request(app)
      .get(`/user/%20`)
      .expect(400)
  })

  it('should fail to get a non-existant user', async () => {
    const newUser = {
      _id: "1234",
      username: "user123",
      firebaseToken: "user12345"
    };

    await userService.createUser(newUser._id, newUser.username, newUser.firebaseToken)
    const response = await request(app)
        .get(`/user/4321`)
        .expect(200)

    expect(response.body).toBeNull()
  });
})

describe('Testing handleGoogleSignIn', () => {
  it('should fail to sign in a user with improper credentials', async () => {
    const response = await request(app)
        .post(`/user/auth`)
        .send({
          irrelevant: "something useless"
        })
        .expect(400)

    expect(response.body.message).toBe("No Token provided")
  });
})