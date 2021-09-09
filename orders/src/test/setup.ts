import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
    process.env.JWT = 'asdasdas';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = () => {
    // Build a JWT payload { id, email }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };
    // Create JWT
    const token = jwt.sign(payload, process.env.JWT!);
    // Build session object { jwt: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMWI5M2I2NzM3YTM4MDAxODRiMmZiNCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYyOTE5NzIzOH0.RLzThR0OeFrbmKYGPhBQhk5a_69g5PgokV7onz9DOxc }
    const session = { jwt: token };

    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`express:sess=${base64}`];
};