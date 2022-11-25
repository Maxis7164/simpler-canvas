const ts = require("@rollup/plugin-typescript");

module.exports = {
  input: "./index.ts",
  output: {
    file: "bundle.js",
    format: "es",
  },
  plugins: [ts({ tsconfig: "./tsconfig.rollup.json" })],
};
