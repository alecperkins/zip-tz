const zip_tz_1 = require("zip-tz");

if (zip_tz_1.default("10007") !== "America/New_York") {
  throw new Error("Unexpected result");
};
