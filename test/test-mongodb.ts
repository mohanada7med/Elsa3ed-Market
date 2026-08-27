import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://ahmdmohanad28_db_user:<db_password>@cluster0.je3wwaw.mongodb.net/?appName=Cluster0";
const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';

console.log('URI configured:', Boolean(uri));
console.log('Database:', dbName);

if (!uri) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
});

try {
    await client.connect();

    console.log('MONGODB CONNECTED');

    await client.db(dbName).command({ ping: 1 });

    console.log('PING OK');
} catch (error: any) {
    console.error('MONGODB FAILED:', error?.message || error);
} finally {
    await client.close().catch(() => { });
}