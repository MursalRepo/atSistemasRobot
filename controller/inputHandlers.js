const { validateArgs } = require("../helpers/validations");

function inputHandler(input, core) {
  if (validateArgs(input, core)) {
    args = input.split(" ").length;
  } else {
  }
}

module.exports = {
  inputHandler,
};
