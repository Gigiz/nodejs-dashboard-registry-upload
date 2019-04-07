const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { createUploadLink } = require('apollo-upload-client');
const { setContext } = require('apollo-link-context');
const {
  introspectSchema,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
} = require('graphql-tools');
const fetch = require('node-fetch');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const { JWT_SECRET, MONGODB_URI, SERVER_PORT } = process.env;

const authLink = setContext((request, previousContext) => {
  if (previousContext.graphqlContext && previousContext.graphqlContext.req) {
    return {
      headers: {
        'Authorization': previousContext.graphqlContext.req.headers.authorization,
      },
    };
  }
  return null;
}).concat(createUploadLink({ uri: 'http://localhost:4001/graphql', fetch }));


const startServer = async () => {

  const uploadSchema = makeExecutableSchema({ typeDefs, resolvers });

  const authRemoteSchema = await introspectSchema(authLink);

  const authSchema = makeRemoteExecutableSchema({
    schema: authRemoteSchema,
    link: authLink,
  });

  const schema = mergeSchemas({
    schemas: [ authSchema, uploadSchema ],
  });

  const app = express();

  const server = new ApolloServer({ schema, context: req => ({
    ...req,
  })});
  server.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  return await httpServer.listen(SERVER_PORT);
};

mongoose.connect(MONGODB_URI, { 
  useCreateIndex: true,
  useNewUrlParser: true,
})
.then(() => {
  startServer().then(() => {
    console.log(`Server start at ${SERVER_PORT}`);
  });
  // httpServer.listen(SERVER_PORT);
})
.catch(err => {
  console.log(err);
});


