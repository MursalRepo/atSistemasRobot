const redis = require("redis");
const config = require("../common/config");
const { promisify } = require("util");

/**
 * @description Connecto to redis client.
 * @returns {Promise<Object>} Connected redis client.
 */
module.exports.init_redis = () => {
  const client = redis.createClient(config.redis.host);

  client.on("connect", function () {});
  client.on("error", (err) => {
    console.error(`Redis client could not connect: ${err}`);
  });
  client.hgetall = promisify(client.hgetall).bind(client);
  return client;
};
