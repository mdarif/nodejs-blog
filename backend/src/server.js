import express from 'express';

// in memory database
let articlesInfo = [
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
];

const app = express();

//middleware
app.use(express.json());

app.put('/api/articles/:name/upvote', (req, res) => {
  console.log('req.params', req.params);
  const { name } = req.params;

  const article = articlesInfo.find((info) => info.name === name);
  if (article) {
    article.upvotes += 1;
    res.send(`The ${name} article now has ${article.upvotes} upvote(s)`);
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

app.post('/api/articles/:name/comments', (req, res) => {
  console.log(req.body, req.params);
  const { name } = req.params;
  const { postedBy, text } = req.body;

  const article = articlesInfo.find((a) => a.name === name);

  if (article) {
    article.comments.push({ postedBy, text });
    res.send(article.comments);
  } else {
    res.send("This article doesn't exist!");
  }
});

app.listen(8000, () => {
  console.log('Server is listening on port 8000', (req, res) => {});
});