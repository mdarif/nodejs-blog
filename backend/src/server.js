import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js';
import path from 'path';
import 'dotenv/config';

// fileURLToPath is a Node.js API
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Firebase Admin SDK
 *
 * The Firebase Admin SDK is a server-side SDK that allows you to
 * access Firebase services from privileged environments such as
 * your server.
 *
 * The Admin SDK is required for server-side development.
 *
 */

// Import credentials from the JSON file downloaded using fs module
const credentials = JSON.parse(fs.readFileSync('./credentials.json'));

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

/**
 * express()
 *
 * Creates an Express application. The express() function is a top-level function
 * exported by the express module.
 */
const app = express();

// Global middleware to parse application/json
app.use(express.json());

// Global middleware to parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, '../build')));

// If routes (api endpoints) are not found return index.html
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// express middleware to automatically load User information whenever we receive a request
app.use(async (req, res, next) => {
  const { authtoken } = req.headers;

  // Verify incoming auth token from the request header
  if (authtoken) {
    try {
      req.user = await admin.auth().verifyIdToken(authtoken);
    } catch (error) {
      return res.sendStatus(400);
    }
  }

  req.user = req.user || {};

  next(); // programme execution should move to the below code
});

app.get('/api/articles/:name', async (req, res) => {
  // get the value of URL param
  const { name } = req.params;
  const { uid } = req.user;

  // query to load the article
  const article = await db.collection('articles').findOne({ name });

  if (article) {
    // send it back to the client

    // add extra property into our mongodb named 'upvoteIds' if it does not exist already
    const upvoteIds = article.upvoteIds || []; // default should be an empty array

    article.canUpvote = uid && !upvoteIds.includes(uid); // upvoteIds does not include 'uid'

    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

/**
 * Application-level middleware
 *
 * The function is executed every time the app receives a request.
 */
app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401); // Unauthorized response status code
  }
});

app.put('/api/articles/:name/upvote', async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;

  // query to load the article
  const article = await db.collection('articles').findOne({ name });

  if (article) {
    const upvoteIds = article.upvoteIds || [];

    // If 'uid' presents in upvoteIds Array than canUpvote will be false means user already upvoted
    // and he can't upvote again
    const canUpvote = uid && !upvoteIds.includes(uid);

    // Logged in user can upvote only once
    if (canUpvote) {
      await db.collection('articles').updateOne(
        { name }, // filter
        {
          $inc: {
            upvotes: 1, // increment upvotes by 1
          },
          $push: { upvoteIds: uid }, // add uid into upvoteIds Array
        }
      );
    }
    // get the updated article
    const updatedArticle = await db.collection('articles').findOne({ name });

    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist");
  }
});

app.post('/api/articles/:name/comments', async (req, res) => {
  const { name } = req.params;
  const { text } = req.body;
  const { email } = req.user;

  // const article = articlesInfo.find((a) => a.name === name);

  await db.collection('articles').updateOne(
    { name },
    {
      $push: { comments: { postedBy: email, text } },
    }
  );

  // load the updated articles
  const article = await db.collection('articles').findOne({ name });

  if (article) {
    // article.comments.push({ postedBy, text });
    res.json(article);
  } else {
    res.send("This article doesn't exist!");
  }
});

const PORT = process.env.PORT || 8000;

connectToDb(() => {
  console.log('Successfully connected to DB!');
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
