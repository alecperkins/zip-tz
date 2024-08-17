const zipTZ = require("zip-tz");

if (zipTZ("10007") !== "America/New_York") {
  throw new Error("Unexpected result");
};
