// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any

const newHotkey = async ({
  name,
  coldkeyName,
}: {
  name: string;
  coldkeyName: string;
}) => {
  return new Promise((resolve, reject) => {
    exec(
      `btcli new_hotkey --wallet.name ${coldkeyName} --wallet.hotkey ${name} | grep regen_hotkey`,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
     const { name,coldkeyId } = JSON.parse(req.body);
     if (!name || !coldkeyId) {
     return res.status(401).json({ error: "oops, there was a problem" });
     }

     const coldkey = await Coldkey.findOne({ where: { id: coldkeyId } });

     if(!coldkey){
      throw new Error("coldkey unknown")
     }

     const mnemonic = await newHotkey({ name, coldkeyName: coldkey.name });
     const hotkey = await Hotkey.create({
       name,
       coldkeyId,
       coldkey: coldkey,
       registered: false
     }, {include:[Coldkey]});
      // @ts-ignore
     hotkey.setColdkey(coldkey);
 
     res.status(200).json({
       hotkey,
       mnemonic,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops, there was a problem" });
   }
}
