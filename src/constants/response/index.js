const globalCodes = require("./global.responses.json");
const authErrorCodes = require("./auth.responses.json");

const errorCodes = require("./errors.json");

module.exports = {
  GLOBAL_CODES_HANDLER: globalCodes,
  AUTH_CODES_HANDLER: authErrorCodes,
  ERROR_CODE_HANDLER: errorCodes,
};
