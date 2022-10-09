const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "port", alias: "p", type: Number },
  { name: "use_http", type: Boolean },
];
const options = typeof window !== "undefined" ? {} :commandLineArgs(optionDefinitions);
export const cmdOptions = options;
