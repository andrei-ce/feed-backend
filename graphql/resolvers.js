const resolvers = {
  Query: {
    hello: () => ({
      name: 'Albie',
      email: 'abc@email.com',
      password: 1234,
      status: 'Sleeping',
    }),
  },
};

module.exports = resolvers;
