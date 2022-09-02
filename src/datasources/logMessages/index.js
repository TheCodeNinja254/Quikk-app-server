const convertKeys = require('../../utils/convertKeys');
const Logger = require('../../utils/logging');
const ErrorHandler = require('../../utils/errorHandler');

const LogMessages = (response, callback, apiUrl, addedDetails = {}) => {
  const { header: { responseCode, responseMessage, customerMessage } } = convertKeys(response);
  if (responseCode === 200 || responseCode === 1000) {
    Logger.log(
      'info',
      'Success: ',
      {
        message: "Request Successful",
        addedDetails,
        callback,
        // response, // Todo for debugging only
        url: apiUrl,
      },
    );
  } else {
    Logger.log(
      'error',
      'Error: ',
      {
        fullError: response,
        callback,
        addedDetails,
        customError: `Got (${responseCode}) while hitting ${apiUrl}`,
        actualError: responseMessage,
        customerMessage: ErrorHandler(customerMessage),
      },
    );
  }
};

module.exports = LogMessages;
