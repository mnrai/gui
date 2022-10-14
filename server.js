const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { exec } = require("child_process");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const fs = require( "node:fs/promises");
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const { Coldkey,Hotkey, init, Stat, User } = require("./models/models");
const { parse:parseCsv } = require("csv-parse/sync");
const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "port", alias: "p", type: Number },
  { name: "use_http", type: Boolean },
  { name: "telegram_group_id", type: String },
  { name: "telegram_bot_token", type: String },
];
const options = commandLineArgs(optionDefinitions);

var cron = require("node-cron");

init().then(() => {
  Coldkey.findAll({ include: Hotkey }).then(async (coldkeys) => {
    let coldwalletsFoundOnFileSystem = [];

    try {
      coldwalletsFoundOnFileSystem = await fs.readdir(
        "/root/.bittensor/wallets"
      );
    } catch (e) {

    }

    const coldwalletsFoundOnFileSystemObject = await Promise.all(
      coldwalletsFoundOnFileSystem.map(async (c) => {
        let hotwalletsFoundOnFileSystem = [];

        try {
          hotwalletsFoundOnFileSystem = await fs.readdir(
            `/root/.bittensor/wallets/${c}/hotkeys`
          );
        } catch (e) {

        }

        return {
          name: c,
          hotkeys: hotwalletsFoundOnFileSystem,
        };
      })
    );
    Promise.all(
      coldwalletsFoundOnFileSystemObject.map(async (c) => {
        let dbcoldkeyobject = coldkeys?.find((ck) => ck.name === c.name);
        if (!dbcoldkeyobject) {
          dbcoldkeyobject = await Coldkey.create({
            name: c.name,
          });
        }


        if (
          !dbcoldkeyobject.Hotkeys || c.hotkeys.length >
          dbcoldkeyobject.Hotkeys.length
        ) {


          const hotkeysToCreate = c.hotkeys.filter(
            (hk) => !dbcoldkeyobject.Hotkeys?.find((htk) => htk.name === hk)
          );



          await Promise.all(
            hotkeysToCreate.map(async (hkname) => {
              try {
                const newlyCreatedHotkey = await Hotkey.create({
                  name: hkname,
                  coldkeyId: dbcoldkeyobject.id,
                  coldkey: dbcoldkeyobject,
                  registered: false,
                });

                newlyCreatedHotkey.setColdkey(dbcoldkeyobject);

                return true;
              } catch (e) {

              }
            })
          );
        }
      })
    );
    const minutes = (new Date()).getMinutes() +1


    cron.schedule(
      `${minutes % 60},${(minutes + 20) % 60},${(minutes + 40) % 60} * * * *`,
      async () => {
        const coldkeys = await Coldkey.findAll();
        const coldkeyNames = coldkeys.map((c) => c.name);


        const res = await Promise.all(
          coldkeyNames.map((name) => {
            return new Promise((resolve, reject) => {
              exec(
                `btcli overview --wallet.name ${name} --no_prompt --width 200 | sed -e '/Wallet -/d' -e '/AC../d' -e '/τ/d' | awk  '{print $1"|"$2"|"$5"|"$7"|"$10"|"$12}'`,
                (err, stout, stderr) => {
                  if (err) {
                    reject(err);
                  }
                  resolve({ name, data: stout });
                }
              );
            });
          })
        );




        const res2 = await Promise.all(
          res.map(async ({ name, data }) => {
            try {
              const records = parseCsv(data, { delimiter: "|" });

              const updatedValueHigh = records.filter(r=>parseInt(r[5] )> 300);
              const trustLow = records.filter(r=>parseFloat(r[3] ) < 0.5);

              if (updatedValueHigh.length || trustLow.length) {
                try {

                  let telegram_group_id = options?.telegram_group_id;
                  let telegram_bot_token = options?.telegram_bot_token;


                  try {

                    const users = await User.findAll();
                    const user = users[0];
                      telegramGroupChatId = user.telegramGroupChatId;
                       telegramBotToken = user.telegramBotToken;

                    if(telegramGroupChatId && telegramBotToken) {
                      telegram_group_id =telegramGroupChatId;
                      telegram_bot_token =telegramBotToken;
                    }

                  }catch(e){

                  }
                  

                  if( telegram_group_id && telegram_bot_token) {
                    const updatedMessage = updatedValueHigh.length ? updatedValueHigh.map(
                      (r) => `(Coldkey name: "${r[0]}"- Hotkey name: ${r[1]}) High updated value alert (${r[5]}). `
                    ): "";
                    const lowTrustMessage = trustLow.length
                      ? trustLow.map(
                          (r) =>
                            `(Coldkey name: "${r[0]}"- Hotkey name: ${r[1]}) Low trust alert (${r[3]}). `
                        )
                      : "";
       

                    exec(
                      `curl --data chat_id="${telegram_group_id}" --data-urlencode "text=${updatedMessage}${lowTrustMessage}" https://api.telegram.org/bot${telegram_bot_token}/sendMessage`,
                      (err, stout, stderr) => {
                        if (err) {
                          console.log(err);
                        }
                        // console.log({stout})
                      }
                    );
                  }
                } catch(e) {
                  console.log(e)
                }
              }


              const amount = parseFloat(
                records
                  .filter((r) => r[2])
                  .map((r) =>
                    !isNaN(parseFloat(r[2]))
                      ? parseFloat(r[0]?.replace("…", ""))
                      : 0
                  )
                  .reduce((total, r) => total + r, 0)
              );
              const trust = parseFloat(
                records
                  .filter((r) => r[3])
                  .map((r) =>
                    !isNaN(parseFloat(r[1]))
                      ? parseFloat(r[3]?.replace("…", ""))
                      : 0
                  )
                  .reduce((total, r) => total + r, 0)
              );

              const key = coldkeys.find((c) => c.name === name);

              const stat = await Stat.create(
                {
                  amount: amount,
                  coldkey: key,
                  trust: trust,
                  coldkeyId: key.id,
                },
                { include: [Coldkey] }
              );
              stat.setColdkey(key);
            } catch (e) {}

            return true;
          })
        );

        const stats = await Stat.findAll();
      }
    );

    app.prepare().then(() => {
      createServer(async (req, res) => {
        try {
          // Be sure to pass `true` as the second argument to `url.parse`.
          // This tells it to parse the query portion of the URL.
          const parsedUrl = parse(req.url, true);
          const { pathname, query } = parsedUrl;

          //   if (pathname === "/a") {
          //     await app.render(req, res, "/a", query);
          //   } else if (pathname === "/b") {
          //     await app.render(req, res, "/b", query);
          //   } else {
          await handle(req, res, parsedUrl);
          //   }
        } catch (err) {
          console.error("Error occurred handling", req.url, err);
          res.statusCode = 500;
          res.end("internal server error");
        }
        // @ts-ignore;
      }).listen(options.port || port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${options.port || port}`);
      });
    });
  });
});
