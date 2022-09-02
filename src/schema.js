const { gql } = require("apollo-server-koa");

const typeDefs = gql`
  scalar Date

  type Query {
    getTransactions: TransactionsData
  }

  type Mutation {
    signIn(input: SignInInput!): SignInResponse!
    createAccount(input: CreateAccountInput!): CreateAccountResponse!
    sendMoney(input: SendMoneyInput!): SendMoneyResponse!
  }
  
  input SignInInput {
    username: String!
    password: String!
  }
  
  input CreateAccountInput {
    username: String
    password: String
    emailAddress: String
    firstName: String
    lastName: String
    phoneNumber: String
    rechargeAmount: Int
  } 
  
  type CreateAccountResponse {
    status: Boolean!
    message: String!
    username: String
    emailAddress: String
    firstName: String
    lastName: String
    phoneNumber: String
    accountBalance: Int
  }
  
  input SendMoneyInput {
    recipientId: String
    recipientIdType: String
    amount: Int
  }
  
  type SignInResponse {
    status: Boolean
    message: String
    firstName: String
    lastName: String
    phoneNumber: String
    emailAddress: String
    lastLogin: Date
    accountInfo: accountInfo
  }
  
  type SendMoneyResponse {
    status: Boolean!
    message: String!
    transactionId: Int
    confirmationCode: String
    newBalance: Int
    timestamp: Date
  }
  
  type accountInfo {
    accountBalance: Int
    accountPrimaryCurrency: String
    accountStatus: String
  }
  
  type TransactionsData {
    getTransactionsStatus: Boolean!
    transactions: [Transactions]
  }
  
  type Transactions {
    transactionId: Int!
    recipientEmail: String
    recipientPhoneNumber: String
    amount: String
    currency: String
    timestamp: Date
  }
`;

module.exports = typeDefs;
