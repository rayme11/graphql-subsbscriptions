const FAVORITEUPDATES = 'FAVORITEUPDATES';

module.exports = {
  favorites: {
    subscribe: (parent, args, { pubsub }, info) => {
      return pubsub.asyncIterator([FAVORITEUPDATES]);
    },
  },
};
