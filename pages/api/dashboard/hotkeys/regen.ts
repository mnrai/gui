// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler } from "helpers";
import { cmdOptions } from "helpers/cmdOptions";

type Data = any

const regenHotkey = async ({
  name,
  coldkeyName,
  mnemonic,
}: {
  name: string;
  coldkeyName: string;
  mnemonic: string;
}) => {
  return new Promise((resolve, reject) => {
    exec(
      `btcli regen_hotkey --no_prompt --wallet.name ${coldkeyName} --wallet.hotkey ${name} --mnemonic ${mnemonic} | grep regen_hotkey`,
      { shell: "/bin/bash", encoding: "utf8" },
      (err, stout, stderr) => {
        if (err) {
          reject("oops");
        }
        exec(
          "rm -rf /workspace/wallets && cp -r ~/.bittensor/wallets /workspace/wallets",
          (err, stout, stderr) => {}
        );
        resolve(stout);
      }
    );
  });
};

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
       if (cmdOptions.use_http) {
         throw new Error("cannot be used with http");
       }
     const { name, coldkeyId, mnemonic } = JSON.parse(req.body);
     if (!name || !coldkeyId || !mnemonic) {
    return res.status(401).json({ error: "oops, there was a problem" });
     }
     const coldkey = await Coldkey.findOne({ where: { id: coldkeyId } });

     if (!coldkey) {
       throw new Error("coldkey unknown");
     }
     const response = await regenHotkey({
       name,
       coldkeyName: coldkey.name,
       mnemonic,
     });

     const hotkey = await Hotkey.create(
       {
         name,
         coldkeyId,
         coldkey: coldkey,
         registered: false,
       },
       { include: [Coldkey] }
     );
     // @ts-ignore
     hotkey.setColdkey(coldkey);
     res.status(200).json({
       hotkey,
     });
   } catch (e) {
    return res.status(401).json({ error: "oops, there was a problem" });
   }
})
