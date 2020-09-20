const core = {};
core.redis = require("./db").init_redis();
module.exports = core;
