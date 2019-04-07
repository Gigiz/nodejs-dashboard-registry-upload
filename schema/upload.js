const { gql } = require('apollo-server-express');

const uploadDef = gql`
  scalar Upload

  type File {
    _id: ID!
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Registry {
    _id: ID!
    firstName: String!
    lastName: String!
    birthDate: String!
    birthCity: String!
    taxCode: String!
  }

  type Stats {
    username: String!
    success: Boolean!
  }
  
  type Query {
    registry: [Registry]!
  }

  type Mutation {
    upload(file: Upload!, username: String!): Boolean!
    remove: Boolean!
  }

  type Subscription {
    latestUpload(username: String!): Stats
  }

`;

module.exports = uploadDef;