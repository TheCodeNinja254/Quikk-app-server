const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

module.exports = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value; // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      throw new Error("Please pass a date");
    },
  }),
  Query: {
    getTransactions: (_, __, { dataSources }) => dataSources.transactions.getTransactions(),
  },
  Mutation: {
    sendMoney: (_, args, { dataSources }) => dataSources.transactions.sendMoney(args),
    signIn: (_, args, { dataSources }) => dataSources.authentication.signIn(args),
    createAccount: (_, args, { dataSources }) => dataSources.authentication.createAccount(args),
  },
};
