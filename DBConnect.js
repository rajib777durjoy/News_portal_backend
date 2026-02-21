import dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.u87dt.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const db = client.db('newsPortal');
export const collection = db.collection('articles');

export const DBConnection = async () => {
    try {
        await client.connect();
        console.log("MongoDB connected successfully!");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

