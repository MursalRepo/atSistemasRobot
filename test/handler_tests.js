const { expect } = require("chai");
const core = require("../core");
require("mocha-sinon");
const {
  isOnGrid,
  moveForward,
  validateMoveCommands,
  rotateRobotLeft,
  rotateRobotRight,
  moveRobot,
  isCoordsOk,
} = require("../controller/inputHandlers");

describe("User input handling and controll movement tests", () => {
  beforeEach(function () {
    this.sinon.stub(console, "log");
  });

  it("Check if the Robot coords is on the GRID", async () => {
    core.redis.hset("GRID", "length_x", 5);
    core.redis.hset("GRID", "length_y", 6);
    const placedCorrectly = await isOnGrid(3, 5, core);
    expect(placedCorrectly).to.equal(true);
    const notPlacedCorrectly = await isOnGrid(8, 5, core);
    expect(notPlacedCorrectly).to.equal(false);
  });

  it("Should check X and Y values", () => {
    let args = ["X", "3"];
    isCoordsOk(args);
    expect(console.log.calledWith("X value must be a positive integer")).to.be
      .true;

    args = ["-1", "6"];
    isCoordsOk(args);
    expect(console.log.calledWith("X value must be a positive integer")).to.be
      .true;

    args = ["66", "6"];
    isCoordsOk(args);
    expect(console.log.calledWith("X value must be within 50")).to.be.true;

    args = ["2", "Y"];
    isCoordsOk(args);
    expect(console.log.calledWith("Y value must be a positive integer")).to.be
      .true;

    args = ["1", "-6"];
    isCoordsOk(args);
    expect(console.log.calledWith("Y value must be a positive integer")).to.be
      .true;

    args = ["3", "69"];
    isCoordsOk(args);
    expect(console.log.calledWith("Y value must be within 50")).to.be.true;
  });

  it("Should move robot one cell to each direction", () => {
    let coords = moveForward(1, 1, "N");
    expect(coords[0]).to.equal(1);
    expect(coords[1]).to.equal(2);
    coords = moveForward(1, 1, "S");
    expect(coords[0]).to.equal(1);
    expect(coords[1]).to.equal(0);
    coords = moveForward(1, 1, "E");
    expect(coords[0]).to.equal(2);
    expect(coords[1]).to.equal(1);
    coords = moveForward(1, 1, "W");
    expect(coords[0]).to.equal(0);
    expect(coords[1]).to.equal(1);
  });

  it("Should rotate the robot to the left", () => {
    // from North to West
    let rotation = rotateRobotLeft("N");
    expect(rotation).to.equal("W");

    // from West to South
    rotation = rotateRobotLeft("W");
    expect(rotation).to.equal("S");

    // from South to East
    rotation = rotateRobotLeft("S");
    expect(rotation).to.equal("E");

    // from East to North
    rotation = rotateRobotLeft("E");
    expect(rotation).to.equal("N");
  });

  it("Should rotate the robot to the right", () => {
    // from North to Ease
    let rotation = rotateRobotRight("N");
    expect(rotation).to.equal("E");

    // from East to South
    rotation = rotateRobotRight("E");
    expect(rotation).to.equal("S");

    // from South to West
    rotation = rotateRobotRight("S");
    expect(rotation).to.equal("W");

    // from West to North
    rotation = rotateRobotRight("W");
    expect(rotation).to.equal("N");
  });

  it("Should parse, check and validate user input for robot movement command", async () => {
    await core.redis.del("ROBOT"); // Remove Robot from grid if exist
    await core.redis.del("GRID"); // Remove Grid if exist
    let args = "FFFRRFF";

    // grid is not set
    let ret = await validateMoveCommands(args, core);
    expect(ret).to.equal(false);

    // robot not placed
    core.redis.hset("GRID", "length_x", 5);
    core.redis.hset("GRID", "length_y", 6);
    ret = await validateMoveCommands(args, core);
    expect(ret).to.equal(false);

    // incorrect movement command
    args = "rfrKfm";
    core.redis.hset("ROBOT", "x", 1);
    core.redis.hset("ROBOT", "y", 2);
    core.redis.hset("ROBOT", "direc", "N");
    console.log(args);
    ret = await validateMoveCommands(args, core);
    expect(ret).to.equal(false);

    // validate correctly
    args = "FFRF";
    ret = await validateMoveCommands(args, core);
    expect(ret).to.deep.equal({
      x: "1",
      y: "2",
      direc: "N",
    });
  });

  it("Should move robot according to commands", async () => {
    let args = ["LLFFFLFLFL"];

    core.redis.hset("GRID", "length_x", 5);
    core.redis.hset("GRID", "length_y", 6);

    core.redis.hset("ROBOT", "x", 0);
    core.redis.hset("ROBOT", "y", 3);
    core.redis.hset("ROBOT", "direc", "W");

    const robotPosition = await validateMoveCommands(args, core);

    await moveRobot(args, robotPosition, core);

    const newPos = await core.redis.hgetall("ROBOT");
    expect(newPos).to.deep.equal({
      x: "2",
      y: "4",
      direc: "S",
    });
  });
});
