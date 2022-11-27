import express from 'express';
import { db, connectToDb } from './db.js';

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

app.get('/api/articles/:name', async (req, res) => {
  // get the value of URL param
  const { name } = req.params;

  // query to load the article
  const article = await db.collection('articles').findOne({ name });

  if (article) {
    // send it back to the client
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.put('/api/articles/:name/upvote', async (req, res) => {
  const { name } = req.params;

  // const article = articlesInfo.find((info) => info.name === name);

  await db.collection('articles').updateOne(
    { name },
    {
      $inc: {
        upvotes: 1,
      },
    }
  );

  // query to load the article
  const article = await db.collection('articles').findOne({ name });

  if (article) {
    // article.upvotes += 1;
    res.json(article);
  } else {
    res.send("That article doesn't exist");
  }

  console.log('article found', article);
});

// app.get('/hello/:name', (req, res) => {
//   const name = req.params.name;
//   res.send(`Hello ${name}!!`);
// });

// app.post('/hello', (req, res) => {
//   console.log(req.body);
//   res.send(`Hello ${req.body.name}`);
// });

app.post('/api/articles/:name/comments', async (req, res) => {
  console.log(req.body, req.params);
  const { name } = req.params;
  const { postedBy, text } = req.body;

  // const article = articlesInfo.find((a) => a.name === name);

  await db.collection('articles').updateOne(
    { name },
    {
      $push: { comments: { postedBy, text } },
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
