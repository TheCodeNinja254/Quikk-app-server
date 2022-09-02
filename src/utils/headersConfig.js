const _ = require("lodash");
const configValues = require("dotenv").config().parsed;

// Some of the headers that are commonly used
const commonHeaders = {
  "Content-Type": "application/json",
  // Accept: "application/json",
};

class HeadersConfig {
  apiHeaders(request) {
    const headers = {
      Authorization: `Bearer ${configValues.BEARER_TOKEN}`,
    };

    // Add common headers
    _.forOwn(commonHeaders, (header, name) => {
      request.headers.set(name, header);
    });

    // Add custom headers
    _.forOwn(headers, (header, name) => {
      request.headers.set(name, header);
    });
  }
}

module.exports = HeadersConfig;
