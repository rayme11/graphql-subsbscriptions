require('dotenv').config();
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const { PubSub } = require('apollo-server');

const SessionDataSource = require('./datasources/sessions');
const SpeakerDataSource = require('./datasources/speakers');
const { UserDataSource } = require('./datasources/users');

const { generateUserModel } = require('./models/user');
const { AuthDirective } = require('./directives/AuthDirective');

const {
  createRateLimitTypeDef,
  createRateLimitDirective,
  defaultKeyGenerator,
} = require('graphql-rate-limit-directive');

const depthLimit = require('graphql-depth-limit');

const { createComplexityLimitRule } = require('graphql-validation-complexity');

const typeDefs = require('./schema.js');
const resolvers = require('./resolvers/index');
const auth = require('./utils/auth');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const pubsub = new PubSub();

const dataSources = () => ({
  sessionDataSource: new SessionDataSource(),
  speakerDataSource: new SpeakerDataSource(),
  userDataSource: new UserDataSource(),
});

app.use(cookieParser());

const keyGenerator = (directiveArgs, obj, args, context, info) =>
  context.user
    ? `${context.user.sub}:${defaultKeyGenerator(
        directiveArgs,
        obj,
        args,
        context,
        info
      )}`
    : defaultKeyGenerator(directiveArgs, obj, args, context, info);

const server = new ApolloServer({
  typeDefs: [createRateLimitTypeDef(), typeDefs],
  resolvers,
  dataSources,
  subscriptions: {
    onDisconnect: () => {
      console.log('Disconnecting');
    },
    onConnect: (params, WebSocket) => {
      const cookie = WebSocket.upgradeReq.headers.cookie.split('token=')[1];
      const user = auth.verifyToken(cookie);
      console.log('Connected: ', user);
      return { user };
    },
  },
  schemaDirectives: {
    requiresAdmin: AuthDirective,
    rateLimit: createRateLimitDirective({
      keyGenerator,
    }),
  },
  validationRules: [
    depthLimit(3),
    createComplexityLimitRule(600, {
      onCost: (cost) => {
        console.log('query cost:', cost);
      },
    }),
  ],
  context: ({ req, res, connection }) => {
    let user = null;

    if (connection && connection.context) {
      user = connection.context.user;
    }
    if (req && req.cookies.token) {
      const payload = auth.verifyToken(req.cookies.token);
      user = payload;
    }
    return {
      user,
      res,
      models: {
        User: generateUserModel({ user }),
      },
      pubsub,
    };
  },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT || 4000, () => {
  console.log(`graphQL running at port 4000`);
});
