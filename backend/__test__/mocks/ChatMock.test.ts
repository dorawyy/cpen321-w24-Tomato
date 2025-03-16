import express, { Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import morgan from 'morgan';
import request from 'supertest';
import { ChatController } from '../../controllers/ChatController';
import { ChatModel } from '../../model/ChatModel';
import { MessageModel } from '../../model/MessageModel';
import { config } from 'dotenv';
import { ChatRoutes } from '../../routes/ChatRoutes';
import { validationResult } from 'express-validator';
import { ChatService } from '../../service/ChatService';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';

const {verifyToken} = require('../../middleware/verifyToken')
let mongoServer = new MongoMemoryServer();

const app = express();
config();
app.use(express.json());  
app.use(morgan('tiny')); 

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'), 
  verify: jest.fn().mockReturnValue({id: "user123"}), 
  sign: jest.fn().mockReturnValue("token")
  }));
const chatController = new ChatController();
if (chatController === null) {
  console.log("ChatController is null")
}
const chatService = new ChatService();

//App routes
ChatRoutes.forEach((route) => {
    const middlewares = (route as any).protected ? [verifyToken] : []; 

    (app as any)[route.method](
        route.route,
        ...middlewares,
        route.validation,
        async (req: AuthenticatedRequest, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                /* If there are validation errors, send a response with the error messages */
                return res.status(400).send({ errors: errors.array() });
            }
            try {
                await route.action(req, res);
            } catch (err) {
                console.error('An error occurred:', err);
                return res.sendStatus(500); // Don't expose internal server workings
            }
        },
    );
});


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await ChatModel.deleteMany({});
  await MessageModel.deleteMany({});
});

afterEach(() => {
  jest.clearAllMocks();
})

describe('Testing addMessage', () => {
  it('should fail to add a message if an error occurs', async () => {
    let spy = await jest.spyOn(MessageModel.prototype, "save").mockImplementation(() => {
      throw new Error("Database error 1")
    })
    const newChat = {
      member_1: "String",
      member_2: "user123"
    };
  
    const newMessage = {
      sender: "user123",
      message: "hi"
    }
  
    const chat = await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const response = await request(app)
      .post(`/chat/${chat.body._id}`) 
      .send(newMessage) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);

    expect(response.body).toBeNull();
    spy.mockClear();
  });
})

describe('Testing createChat', () => {
  it("should fail to create a chat if error occurs", async () => {
    let spy = jest.spyOn(ChatModel, "findOne").mockImplementation(() => {
      throw new Error("Database error 2")
    })
    const newChat = {
      member_1: "new",
      member_2: "user123"
    };
  
    const response = await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);

    expect(response.body).toBeNull();
    spy.mockClear();
  })
})

describe('Testing getChats', () => {
  it('should fail to get chats if error occurs', async () => {
    let spy = jest.spyOn(ChatModel, "find").mockImplementation(() => {
      throw new Error("Database error 3")
    })
    const newChat = {
      member_1: "String",
      member_2: "user123"
    };
  
    const newChat_2 = {
      member_1: "user123",
      member_2: "other"
    };
  
    const main_user = "user123"
    await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    await request(app)
      .post('/chats') 
      .send(newChat_2) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const response = await request(app)
      .get('/chats') 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);

    expect(response.body).toBeNull()
    await spy.mockClear()
  });
})

describe('Testing getChatMessages', () => {
  it('should fail to get messages if error occurs', async () => {
    let spy = await jest.spyOn(MessageModel, "find").mockImplementation(() => {
      throw new Error("Database error 4")
    })
    const newChat = {
      member_1: "user123",
      member_2: "new"
    };
  
    const chat = await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const response = await request(app)
      .get(`/chats/${chat.body._id}`)
      .set('Authorization', 'Bearer 90909090')
      .expect(200)

    expect(response.body).toBeNull();
    await spy.mockClear()
  });
})

describe('Testing deleteChat', () => {
  it('should fail to delete chat if error occurs', async () => {
    let spy = await jest.spyOn(ChatModel, "deleteOne").mockImplementation(() => {
      throw new Error("Database error 5")
    })
    const newChat = {
      member_1: "user123",
      member_2: "new"
    };
  
    const chat = await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const response = await request(app)
      .delete(`/chats/${chat.body._id}`) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
      
    expect(response.body).toBeNull()
    await spy.mockClear()
  });
})

describe('Testing deleteMessage', () => {
  it('should fail to delete message if error occurs', async () => {
    let spy = await jest.spyOn(MessageModel.prototype, "deleteOne").mockImplementation(() => {
      throw new Error("Database error 6")
    })

    const newChat = {
      member_1: "string",
      member_2: "user123"
    };
  
    const newMessage = {
      sender: "user123",
      message: "hi"
    }
  
    const chat = await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const message = await request(app)
      .post(`/chat/${chat.body._id}`) 
      .send(newMessage) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
  
    const response = await request(app)
      .delete(`/chat/${chat.body._id}/messages/${message.body._id}`)
      .set('Authorization', 'Bearer 90909090')
      .expect(200)

    expect(response.body).toBeNull()
    await spy.mockClear()
  });
})

describe('Testing getChat', () => {
  it('should fail to get chat by id if error occurs', async () => {
    let spy = await jest.spyOn(ChatModel, "findById").mockImplementation(() => {
      throw new Error("Database error 6")
    })
    const newChat = {
      member_1: "String",
      member_2: "user123"
    };
    
    const newChat_2 = {
      member_1: "user123",
      member_2: "other"
    };
    
    const main_user = "user123"
    await request(app)
      .post('/chats') 
      .send(newChat) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
    
    let chat = await request(app)
      .post('/chats') 
      .send(newChat_2) 
      .set('Authorization', 'Bearer 90909090')
      .expect(200);
    
    const response = await chatService.getChat(chat.body._id);
    expect(response).toBeNull()
    await spy.mockClear()
  });
})
