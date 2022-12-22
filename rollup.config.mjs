import terser from "@rollup/plugin-terser";
import ts from "@rollup/plugin-typescript";

export default [
  {
    input: "./index.ts",
    output: {
      dir: "dist",
      format: "es",
    },
    plugins: [ts({ tsconfig: "./tsconfig.rollup.json" }), terser({})],
  },
];
