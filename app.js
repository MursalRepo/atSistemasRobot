const core = require("./core");
const controllers = require("./controller/inputHandlers");
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  // terminal: false,
});

reader
  .on("line", getInputs)
  .on("close", () => {
    console.log("Done");
    process.exit(0);
  })
  .setPrompt("Commands: ");
reader.prompt();

function getInputs(input) {
  const action = controllers.inputHandler(input, core);
  reader.prompt();
}
