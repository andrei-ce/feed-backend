const { gql } = require('apollo-server-express');

module.exports = gql`
  type TestData {
    name: String!
    email: String!
    password: Int!
    status: String!
  }

  type Query {
    hello: TestData!
  }
`;

// type User {
//   name: String
//   email: String
//   password: String
//   status: String
//   posts: [ObjectId]
// }

// type Post {
//   title: String
//   imageUrl: String
//   content: String
//   creator: ObjectId
// }

// type Query {
//   hello: String
// }
