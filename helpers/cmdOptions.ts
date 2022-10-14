const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "port", alias: "p", type: Number },
  { name: "use_http", type: Boolean },
  { name: "telegram_group_id", type: String },
  { name: "telegram_bot_token", type: String },
];
const options = typeof window !== "undefined" ? {} :commandLineArgs(optionDefinitions);
export const cmdOptions = options;
