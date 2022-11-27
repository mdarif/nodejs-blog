import { MongoClient } from 'mongodb';

let db;

async function connectToDb(cb) {
  // use mongo client to connect to mongo DB
  const client = new MongoClient('mongodb://127.0.0.1:27017'); // default port for mongodb
  await client.connect();

  db = client.db('react-blog-db');
  cb();
}

export { db, connectToDb };
