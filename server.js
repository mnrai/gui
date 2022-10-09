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
const { Coldkey,Hotkey, init, Stat } = require("./models/models");
const { parse:parseCsv } = require("csv-parse/sync");
const commandLineArgs = require("command-line-args");
const optionDefinitions = [
  { name: "port", alias: "p", type: Number },
  { name: "use_http", type: Boolean },
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

    cron.schedule("5,25,45 * * * *", async () => {
      const coldkeys = await Coldkey.findAll();
      const coldkeyNames = coldkeys.map((c) => c.name);

      const res = await Promise.all(
        coldkeyNames.map((name) => {
          return new Promise((resolve, reject) => {
            exec(
              `btcli overview --wallet.name ${name} --no_prompt --width 200 | sed -e '/Wallet -/d' -e '/AC../d' -e '/τ/d' | awk  '{print $5"|"$7"|"$10}'`,
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
            const records = parseCsv(data, { data: "|" });

            const amount = parseFloat(
              records
                .filter((r) => r[0])
                .map((r) =>
                  !isNaN(parseFloat(r[0]))
                    ? parseFloat(r[0]?.replace("…", ""))
                    : 0
                )
                .reduce((total, r) => total + r, 0)
            );
            const trust = parseFloat(
              records
                .filter((r) => r[1])
                .map((r) =>
                  !isNaN(parseFloat(r[0]))
                    ? parseFloat(r[0]?.replace("…", ""))
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
          } catch (e) {

          }

          return true;
        })
      );

      const stats = await Stat.findAll();
    });

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
