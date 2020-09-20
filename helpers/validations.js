const sha1 = require("sha1");

async function validateArgs(input, core) {
  if (input) {
    const args = input.trim().split(" ");
    switch (args.length) {
      case 1:
        console.log("case 1");
        const isCorrectArgs = await validateMoveCommands(args, core);
        break;
      case 2:
        if (isCoordsOk(args)) {
          console.log("NEW GRID DEFINED");
          core.redis.hset("GRID", "length_x", args[0]);
          core.redis.hset("GRID", "length_y", args[1]);
        }
        break;
      case 3:
        const isValid = await validateRobotArgs(args, core);
        if (isValid) {
          console.log("ROBOT PLACED");
          core.redis.hset("ROBOT", "x", args[0]);
          core.redis.hset("ROBOT", "y", args[1]);
          core.redis.hset("ROBOT", "direc", args[2]);
        }
        break;
      default:
        console.log("Please review your command again");
    }
  }
}

function isCoordsOk(args) {
  if (!parseInt(args[0])) {
    console.log("X value must be a number");
    return false;
  }
  if (parseInt(args[0]) > 50) {
    console.log("X coordinates must be within 50");
    return false;
  }
  if (!parseInt(args[1])) {
    console.log("Y value must be a number");
    return false;
  }
  if (parseInt(args[1]) > 50) {
    console.log("Y coordinate must be within 50");
    return false;
  }
  return true;
}

async function validateRobotArgs(args, core) {
  if (isCoordsOk(args)) {
    const grid = await core.redis.hgetall("GRID");
    if (!grid) {
      console.log("Please first define a grid");
      return false;
    }
    const gridX = grid.length_x;
    const gridY = grid.length_y;
    if (gridX < args[0] || gridY < args[1]) {
      console.log("Robot's coordinates must be on the grid");
      return false;
    }
    const cardDirecs = ["N", "S", "E", "W"];
    if (cardDirecs.includes(args[2])) {
      return true;
    } else {
      console.log(
        "3rd argument of robot direction must be 'N', 'S', 'E' or 'W'"
      );
    }
    return false;
  }
}

async function validateMoveCommands(args, core) {
  args[0].split("").forEach((letter) => {
    if (!["R", "L", "F"].includes(letter)) {
      console.log("Movement args is incorrect");
      return false;
    }
  });

  const grid = await core.redis.hgetall("GRID");
  if (!grid) {
    console.log("Please first define a grid");
    return false;
  }

  const robot = await core.redis.hgetall("ROBOT");
  if (!robot) {
    console.log("Please first place a robot");
    return false;
  }
}

module.exports = {
  validateArgs,
};
