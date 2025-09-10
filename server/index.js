require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const routes = require('./router/routes');
const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});