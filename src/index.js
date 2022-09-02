const Koa = require("koa");
const crypto = require("crypto");
const serve = require("koa-static");
const { ApolloServer } = require("apollo-server-koa");
const session = require("koa-encrypted-session");
const cors = require("@koa/cors");
const convert = require("koa-convert");
const config = require("dotenv");
const helmet = require("koa-helmet");
const { userAgent } = require("koa-useragent");
const Keygrip = require("keygrip");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const ErrorHandler = require("./utils/errorHandler");
const Logger = require("./utils/logging");

config.config();
const configValues = process.env;
const configurations =
  configValues.NODE_ENV === "production"
    ? require("../configs/production.json")
    : require("../configs/development.json");

const TransactionsAPI = require("./datasources/Transactions");
const AuthenticationAPI = require("./datasources/Authentication");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: configValues.NODE_ENV !== "production",
  context: async ({ ctx, connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
    }
    const allowedHeaders = configValues.ORIGIN.split(",");
    const requestUrl = ctx.request.headers.origin;
    if (allowedHeaders.includes(requestUrl)) {
      // check from req
      const token = ctx.request.header.j || "";
      const clientHeaders = ctx.request.header;
      // only allow access to query and mutations if:
      // we have the auth token from the headers
      if (token === configValues.AUTH_TOKEN) {
        return {
          token,
          clientHeaders,
          session: ctx.req.session,
          cookie: ctx.cookie,
          detailedRequest: ctx.req,
          userAgent: ctx.userAgent,
        };
      }
      throw new Error("Oops! You are not authorised to access this server");
    } else {
      throw new Error("Oops! You are not authorised to access this server");
    }
  },
  subscriptions: {
    onConnect: (connectionParams) => {
      const token = connectionParams.Authorization || "";
      if (token === configValues.AUTH_TOKEN) {
        return true;
      }
      throw new Error("Missing auth token!");
    },
    onDisconnect: () => {},
  },
  dataSources: () => ({
    transactions: new TransactionsAPI(),
    authentication: new AuthenticationAPI(),
  }),
  formatError: (err) => {
    // error variables override and redefine them everytime errors fallback here
    let FullError = "";
    let CustomError = "";
    let ActualError = "";
    let CustomerMessage = "";
    FullError = err;
    const {
      path,
      extensions: { response, exception },
    } = err;
    const ExtensionsStackTrace = exception;
    if (response) {
      let httpStatusCode = 0;
      if (response.status && response.statusText) {
        httpStatusCode = response.status;
        CustomError = `(${response.status}): ${response.statusText} while hitting ${response.url}`;
        CustomerMessage = ErrorHandler(response.status);
        err.message = CustomerMessage;
      }
      if (httpStatusCode >= 500) {
        Logger.log("error", "Error: ", {
          fullError: FullError,
          customError: CustomError,
          actualError: ActualError,
          systemError: CustomError,
          customerMessage: CustomerMessage,
        });
      }
      // ensure the 500 errors from our own error mapper are not overwritten
      if (Array.isArray(path) && path.length > 0 && response.status < 500) {
        if (response.body) {
          const { body } = response;
          if (body.header) {
            // customer Message takes precedence over responseMessage
            if (body.header.customerMessage) {
              ActualError = body.header.customerMessage;
              CustomerMessage = ErrorHandler(body.header.customerMessage);
              err.message = CustomerMessage;
            } else if (body.header.responseMessage) {
              ActualError = body.header.responseMessage;
              CustomerMessage = ErrorHandler(body.header.responseMessage);
              err.message = CustomerMessage;
            }
          } else if (body.message) {
            ActualError = body.message;
            CustomerMessage = ErrorHandler(body.message);
            err.message = CustomerMessage;
          }
        } else if (response.header) {
          const { header } = response;
          if (header.customerMessage) {
            ActualError = header.customerMessage;
            CustomerMessage = ErrorHandler(header.customerMessage);
            err.message = CustomerMessage;
          } else if (header.responseMessage) {
            ActualError = header.responseMessage;
            CustomerMessage = ErrorHandler(header.responseMessage);
            err.message = CustomerMessage;
          }
        }
      }
      // ensure client doesn't get the entire response object
      err.extensions.response = "Error";
      if (httpStatusCode < 500) {
        const level = "error";
        const message = "Error: ";
        Logger.log(level, message, {
          fullError: FullError,
          customError: CustomError,
          actualError: ActualError,
          customerMessage: CustomerMessage,
        });
      }
    }
    if (exception) {
      // ensures client doesn't get the stack trace
      err.extensions.exception = "Error";
      if (exception.code === "ECONNREFUSED") {
        CustomerMessage = ErrorHandler(exception.code);
        Logger.log("error", "Customer Message: ", {
          message: CustomerMessage,
          code: exception.code,
          systemError: `${exception.code} - ${CustomerMessage}`,
          actualError: ExtensionsStackTrace,
        });
        err.message = CustomerMessage;
      }

      if (exception.code === "ENOTFOUND") {
        CustomerMessage = ErrorHandler(exception.code);
        Logger.log("error", "Customer Message: ", {
          message: CustomerMessage,
          code: exception.code,
          systemError: `${exception.code} - ${CustomerMessage}`,
          actualError: ExtensionsStackTrace,
        });
        err.message = CustomerMessage;
      }

      if (exception.code === "ECONNRESET") {
        CustomerMessage = ErrorHandler(exception.code);
        Logger.log("error", "Customer Message: ", {
          message: CustomerMessage,
          code: exception.code,
          systemError: `${exception.code} - ${CustomerMessage}`,
          actualError: ExtensionsStackTrace,
        });
        err.message = CustomerMessage;
      }

      if (exception.code === "ETIMEDOUT") {
        CustomerMessage = ErrorHandler(exception.code);
        Logger.log("error", "Customer Message: ", {
          message: CustomerMessage,
          code: exception.code,
          systemError: `${exception.code} - ${CustomerMessage}`,
          actualError: ExtensionsStackTrace,
        });
        err.message = CustomerMessage;
      }
      if (exception.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
        CustomerMessage = ErrorHandler(exception.code);
        Logger.log("error", "Customer Message: ", {
          message: CustomerMessage,
          code: exception.code,
          systemError: `${exception.code} - ${CustomerMessage}`,
          actualError: ExtensionsStackTrace,
        });
        err.message = CustomerMessage;
      }
    }
    if (!response) {
      err.message = ErrorHandler(err.message);
      Logger.log("error", "Error: ", {
        fullError: FullError,
        customError: err.message,
        systemError: FullError,
        actualError: ExtensionsStackTrace,
        customerMessage: err.message,
      });
    }
    return err;
  },
  introspection: configValues.NODE_ENV !== "production",
  playground: configValues.NODE_ENV !== "production",
});

const app = new Koa();

// use random keys to sign the data
app.keys = new Keygrip(
  [crypto.randomBytes(64), crypto.randomBytes(64)],
  "sha512"
);

app.use(userAgent);

const whitelist = configValues.ORIGIN.split(",");

const checkOriginAgainstWhitelist = (ctx) => {
  const requestOrigin = ctx.accept.headers.origin;
  if (!whitelist.includes(requestOrigin)) {
    return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`);
  }
  return requestOrigin;
};

app.use(
  convert(
    cors({
      origin: checkOriginAgainstWhitelist,
      credentials: true,
    })
  )
);

app.use(helmet());
configurations.session.options.secretKey = Buffer.from(
  configValues.COOKIE_ENCRYPTION_KEY,
  "base64"
);
app.use(session(configurations.session.options, app));

app.use(serve("./uploads"));

app.use((ctx, next) => {
  // copy session to native Node's req object because GraphQL execution context doesn't have access to Koa's
  // context, see https://github.com/apollographql/apollo-server/issues/1551
  ctx.set("Access-Control-Allow-Methods", "GET, PUT, POST");
  ctx.set("X-XSS-Protection", "1; mode=block");
  ctx.set("Content-Security-Policy", "default-src");
  ctx.cookie = ctx.cookies;
  ctx.req.session = ctx.session;
  return next();
});

server.applyMiddleware({ app, path: "/quikk-api" });

// Localhost Version
const http = app.listen({ port: configValues.SERVER_PORT || 5052 }, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server ready at port :${configValues.SERVER_PORT}`);
});

module.exports = http;
