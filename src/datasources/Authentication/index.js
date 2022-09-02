const { RESTDataSource } = require("apollo-datasource-rest");
const https = require("https");
const config = require("dotenv").config();
const headersConfig = require("../../utils/headersConfig");

const configValues = config.parsed;

class AuthenticationAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = configValues.API_BASE_URL;
  }

  willSendRequest(request) {
    headersConfig.prototype.apiHeaders(request);
  }

  async signIn(args) {
    const {
      input: { username, password },
    } = args;

    const body = {
      username,
      password,
    };

    try {
      const apiUrl = `${this.baseURL}/sign-in`;
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
          body: {
            firstName,
            lastName,
            emailAddress,
            accountInfo,
            lastLogin,
            phoneNumber,
          },
        } = response;

        status = true;
        return {
          status,
          message: responseMessage,
          firstName,
          lastName,
          emailAddress,
          accountInfo,
          lastLogin,
          phoneNumber,
        };
      }
      return {
        status,
        message: responseMessage,
      };
    } catch (e) {
      throw new Error("Sign in failed, please try again later");
    }
  }

  async createAccount(args) {
    const {
      input: {
        username,
        password,
        emailAddress,
        firstName,
        lastName,
        phoneNumber,
        rechargeAmount,
      },
    } = args;

    const body = {
      username,
      password,
      emailAddress,
      firstName,
      lastName,
      phoneNumber,
      rechargeAmount,
    };

    try {
      const apiUrl = `${this.baseURL}/user-account`;
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
        status = true;
        return {
          status,
          message: responseMessage,
          username: body.username,
          emailAddress: body.emailAddress,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          accountBalance: body.accountBalance,
        };
      }
      return {
        status,
        message: responseMessage,
      };
    } catch (e) {
      throw new Error("Unable to create your account, please try again later");
    }
  }
}

module.exports = AuthenticationAPI;
