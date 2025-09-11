require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const routes = require('./router/routes');
const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res, next) => {
  console.log('req.method', req.method);
  console.log('req.url', req.url);
  console.log('req.query', req.query);
  console.log('req.params', req.params);
  console.log('req.body', req.body);
  next();
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});