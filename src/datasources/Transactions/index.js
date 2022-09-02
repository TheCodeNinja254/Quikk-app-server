const { RESTDataSource } = require("apollo-datasource-rest");
const https = require("https");
const config = require("dotenv").config();
const headersConfig = require("../../utils/headersConfig");

const configValues = config.parsed;

class TransactionsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = configValues.API_BASE_URL;
  }

  willSendRequest(request) {
    headersConfig.prototype.apiHeaders(request);
  }

  async sendMoney(args) {
    const {
      input: { recipientId, recipientIdType, amount },
    } = args;

    const body = {
      recipientId,
      recipientIdType,
      amount,
    };

    try {
      const apiUrl = `${this.baseURL}/transactions`;
      const response = await this.post(apiUrl, body, {
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });
      const {
        header: { responseCode, responseMessage },
      } = response;
      let status = false;
      if (responseCode === 200) {
        const {
          body: { transactionId, confirmationCode, newBalance, timestamp },
        } = response;

        status = true;
        return {
          status,
          message: responseMessage,
          transactionId,
          confirmationCode,
          newBalance,
          timestamp,
        };
      }
      return {
        status,
        message: responseMessage,
      };
    } catch (e) {
      throw new Error("Unable to send money, please try again later");
    }
  }

  async getTransactions() {
    try {
      const apiUrl = `${this.baseURL}/transactions`;
      const response = await this.get(
        apiUrl,
        {},
        {
          agent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }
      );
      const {
        header: { responseCode },
      } = response;
      let getTransactionsStatus = false;
      if (responseCode === 200) {
        getTransactionsStatus = true;
        const transactions =
          response.body.transactions &&
          Array.isArray(response.body.transactions) &&
          response.body.transactions.length > 0
            ? response.body.transactions.map((transaction) =>
                TransactionsAPI.transactionsReducer(transaction)
              )
            : [];

        return {
          getTransactionsStatus,
          transactions,
        };
      }
      return {
        getTransactionsStatus,
      };
    } catch (e) {
      const customerMessage = `Sorry, we are unable to show your transactions`;
      throw new Error(customerMessage);
    }
  }

  static transactionsReducer(transaction) {
    return {
      transactionId: transaction.transactionId,
      recipientEmail: transaction.recipientEmail,
      recipientPhoneNumber: transaction.recipientPhoneNumber,
      amount: transaction.amount,
      currency: transaction.currency,
      timestamp: transaction.timestamp,
    };
  }
}

module.exports = TransactionsAPI;
