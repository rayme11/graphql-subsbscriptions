const Query = require('./query');
const Mutation = require('./mutation');
const Subscription = require('./subscriptions');
const Session = require('./sessions');
const Speaker = require('./speakers');
const User = require('./users');
const resolvers = { Query, Mutation, Subscription, Session, Speaker, User };

module.exports = resolvers;
