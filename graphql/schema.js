const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    name: String
    email: String
    password: String
    status: String
    # posts: [ObjectId]
  }

  type Post {
    title: String
    imageUrl: String
    content: String
    # creator: ObjectId
  }

  type Query {
    hello: String
  }
`;

export default typeDefs;
