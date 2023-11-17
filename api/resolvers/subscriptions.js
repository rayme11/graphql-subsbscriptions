const { withFilter } = require('apollo-server');
const FAVORITEUPDATES = 'FAVORITEUPDATES';

module.exports = {
  favorites: {
    subscribe: withFilter(
      (parent, args, { pubsub, user }, info) => {
        console.log('resolvers!: ', user);
        return pubsub.asyncIterator([FAVORITEUPDATES]);
      },
      (payload, variables) => {
        if (!variables.sessionId) {
          return true;
        }
        return variables.sessionId === payload.favorites.sessionId;
      }
    ),
  },
};
