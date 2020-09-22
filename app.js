const core = require("./core");
const controllers = require("./controller/inputHandlers");
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

console.log("MARTIAN ROBOT\n");
console.log("Steps to follow to control the flow:");
console.log(" - define the grid (max 50) ex: 5 5");
console.log(" - place the robot on the grid and define direction, ex: 1 1 E");
console.log(
  " - order the robot to move based on 3 Commands> L(turn left), R(turn right), F(move one step forward), ex: FFRFLF"
);
console.log(
  "*After move command, robot maintain it is position and continue with next move command"
);
console.log(
  "*If the robot is of the grid and LOST, you have to place a new robot on the grid\n"
);

reader
  .on("line", getInputs)
  .on("close", () => {
    console.log("Done");
    process.exit(0);
  })
  .setPrompt("Commands> ");
reader.prompt();

function getInputs(input) {
  const action = controllers.process(input, core);
  reader.prompt();
}
