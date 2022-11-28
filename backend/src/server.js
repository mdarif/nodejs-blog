import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js';

const credentials = JSON.parse(fs.readFileSync('./credentials.json'));

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

// in memory database
/* let articlesInfo = [
  {
    name: 'learn-react',
    upvotes: 0,
    comments: [],
  },
  {
    name: 'learn-node',
    upvotes: 0,
    comments: [],
  },
  {
    name: 'mongodb',
    upvotes: 0,
    comments: [],
  },
]; */

const app = express();

//middleware
app.use(express.json());

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

    console.log('article.canUpvote', article.canUpvote);

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
    const canUpvote = uid && upvoteIds.includes(uid);

    if (canUpvote) {
      await db.collection('articles').updateOne(
        { name },
        {
          $inc: {
            upvotes: 1,
          },
          $push: { upvoteIds: uid },
        }
      );
    }
    // query to load the article
    const updatedArticle = await db.collection('articles').findOne({ name });
    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist");
  }

  console.log('article found', article);
});

app.post('/api/articles/:name/comments', async (req, res) => {
  console.log(req.body, req.params);
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

connectToDb(() => {
  console.log('Successfully connected to DB!');
  app.listen(8000, () => {
    console.log('Server is listening on port 8000', (req, res) => {});
  });
});
