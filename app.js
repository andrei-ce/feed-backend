const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');
const path = require('path');
const multer = require('multer');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

//____initialize express
const app = express();

//____storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//____middlewares:

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

//static folders
app.use('/images', express.static(path.join(__dirname, 'images')));

//CORS solution:
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//____routes (definitions for graphQL)

const apollo = new ApolloServer({ typeDefs, resolvers });
apollo.applyMiddleware({ app });

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const details = error.details;
  res.status(status).json({ message, details });
});

//____database connection& server spin up
mongoose
  .connect(config.get('MONGO_URI'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(8080, () => {
      console.log(`Server listening on port 8000...`);
      console.log(`Press Cmd+C to exit`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Apollo playground available at http://localhost:8080/graphql`);
      }
    });
  })
  .catch((error) => console.log(error));
