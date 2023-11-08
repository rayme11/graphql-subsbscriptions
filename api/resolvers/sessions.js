const _ = require('lodash');

module.exports = {
  async favoriteCount(session, args, { dataSources }) {
    let users = await dataSources.userDataSource.getFavorites(session.id);
    if (users) {
      return users.length;
    }
    return 0;
  },
  async speakers(session, args, { dataSources }) {
    const speakers = await dataSources.speakerDataSource.getSpeakers(args);

    const returns = speakers.filter((speaker) => {
      return _.filter(session.speakers, { id: speaker.id }).length > 0;
    });

    return returns;
  },
};
