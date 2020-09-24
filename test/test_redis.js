const Redis = require("redis");
const config = require("../common/config");

describe("Test to check the connection to Redis service", function () {
  it("should connect to redis", function () {
    const client = Redis.createClient(config.redis.hostname);

    client.on("connect", () => {
      console.log("Connected redis successfully");
    });
  });
});
