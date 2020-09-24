/**
 * @description Gets arguments from console and takes action based on commands.
 * @param  {String} input user input from console
 * @param  {Object} core core object that contains DB connections
 */
async function process(input, core) {
  if (input) {
    const args = input.trim().split(" ");
    switch (args.length) {
      case 1:
        const robotPosition = await validateMoveCommands(args, core);
        if (robotPosition) {
          await moveRobot(args, robotPosition, core);
        }
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
    return true;
  }
}

/**
 * @description Check if the coordinates is integer and in range of 0 to 40
 * @param  {Array} input user input in array form
 */
function isCoordsOk(args) {
  if (!isPositiveInteger(args[0])) {
    console.log("X value must be a positive integer");
    return false;
  }
  if (parseInt(args[0]) > 50) {
    console.log("X value must be within 50");
    return false;
  }
  if (!isPositiveInteger(args[1])) {
    console.log("Y value must be a positive integer");
    return false;
  }
  if (parseInt(args[1]) > 50) {
    console.log("Y value must be within 50");
    return false;
  }
  return true;
}

/**
 * @description Checks corrdinates and validate robot direction.
 * @param  {Array} args user input in array form
 * @param  {Object} core core object that contains DB connections
 */
async function validateRobotArgs(args, core) {
  if (isCoordsOk(args)) {
    const grid = await core.redis.hgetall("GRID");
    if (!grid) {
      console.log("Please first define a grid");
      return false;
    }
    const gridX = grid.length_x;
    const gridY = grid.length_y;
    if (
      parseInt(gridX) < parseInt(args[0]) ||
      parseInt(gridY) < parseInt(args[1])
    ) {
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

/**
 * @description Checks if grid and robot is defined and movement commands is correct.
 * @param  {Array} args user input in array form
 * @param  {Object} core core object that contains DB connections
 */
async function validateMoveCommands(args, core) {
  let moveCommands = true;
  args[0].split("").forEach((letter) => {
    if (!["R", "L", "F"].includes(letter)) {
      moveCommands = false;
    }
  });
  if (!moveCommands) {
    console.log("Move commands are incorrect");
    return false;
  }

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
  return robot;
}

/**
 * @description Move robot based on user commands and save into the redis.
 * @param  {Array} args user input in array form
 * @param  {Object} robotPosition current position of the robot
 * @param  {Object} core core object that contains DB connections
 */
async function moveRobot(args, robotPosition, core) {
  let posX = robotPosition.x;
  let posY = robotPosition.y;
  var dir = robotPosition.direc;
  args[0].split("").forEach((l) => {
    switch (l) {
      case "R":
        dir = rotateRobotRight(dir);
        break;
      case "L":
        dir = rotateRobotLeft(dir);
        break;
      case "F":
        var newPositions = moveForward(posX, posY, dir);
        posX = newPositions[0];
        posY = newPositions[1];
        break;
    }
  });
  const onGrid = await isOnGrid(posX, posY, core);
  if (onGrid) {
    console.log("current position:", posX, posY, dir);
    core.redis.hset("ROBOT", "x", posX);
    core.redis.hset("ROBOT", "y", posY);
    core.redis.hset("ROBOT", "direc", dir);
    return "T";
  } else {
    console.log("current position:", posX, posY, dir, "LOST");
    core.redis.del("ROBOT");
    return "P";
  }
}

/**
 * @description Rotate the robot direction to the right.
 * @param  {String} dir current direction of the robot
 */
function rotateRobotRight(dir) {
  switch (dir) {
    case "N":
      dir = "E";
      break;
    case "E":
      dir = "S";
      break;
    case "S":
      dir = "W";
      break;
    case "W":
      dir = "N";
      break;
  }
  return dir;
}

/**
 * @description Rotate the robot direction to the left.
 * @param  {String} dir current direction of the robot
 */
function rotateRobotLeft(dir) {
  switch (dir) {
    case "N":
      dir = "W";
      break;
    case "E":
      dir = "N";
      break;
    case "S":
      dir = "E";
      break;
    case "W":
      dir = "S";
      break;
  }
  return dir;
}

/**
 * @description Move the robot forward.
 * @param  {String} x current X coordinate of the robot
 * @param  {String} y current Y coordinate of the robot
 * @param  {String} dir current direction of the robot
 */
function moveForward(x, y, dir) {
  switch (dir) {
    case "N":
      y++;
      break;
    case "S":
      y--;
      break;
    case "E":
      x++;
      break;
    case "W":
      x--;
      break;
  }
  return [x, y];
}

/**
 * @description Check the position of the robot if it is on the grid
 * after the movement or it is lost.
 * @param  {String} x current X coordinate of the robot
 * @param  {String} y current Y coordinate of the robot
 * @param  {Object} core core object that contains DB connections
 */
async function isOnGrid(x, y, core) {
  const grid = await core.redis.hgetall("GRID");
  if (x >= 0 && x <= grid.length_x && y >= 0 && y <= grid.length_y) {
    return true;
  }
  return false;
}

/**
 * @description Check input value to be a positive integer
 * @Return {Bool} true of positive integer else false
 */
function isPositiveInteger(str) {
  var num = Math.floor(Number(str));
  return num !== Infinity && String(num) === str && num >= 0;
}

module.exports = {
  process,
  isOnGrid,
  moveForward,
  rotateRobotLeft,
  rotateRobotRight,
  validateMoveCommands,
  moveRobot,
  isCoordsOk,
};
