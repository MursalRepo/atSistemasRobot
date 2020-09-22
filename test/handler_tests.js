// import { Map } from "immutable";
// import { expect } from "chai";
const core = require("../core");
const Map = require("immutable");
const isOnGrid = require("../controller/inputHandlers");

describe("user input handling and controll movement tests", () => {
  it("Check if the GRID is exist in the redis", async () => {
    // const nextState = isOnGrid("3", "5", core);
    const grid = await core.redis.hgetall("GRID");
    console.log(grid);
    // expect(nextState).to.equal(false);
  });
});
