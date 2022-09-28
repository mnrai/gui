// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any

const regenColdkey = async ({
  name,
  password,
  mnemonic,
}: {
  name: string;
  password: string;
  mnemonic: string;
}) => {
  return new Promise((resolve, reject) => {
    exec(
      'echo "#!/usr/bin/expect" > r__c;chmod 700 r__c;echo "set timeout 20" >> r__c;echo "spawn btcli regen_coldkey --mnemonic ' +
        mnemonic +
        " --wallet.name " +
        name +
        ';" >> r__c;echo "expect \\"yption: \\";" >> r__c;echo "send \\"' +
        password +
        '\\r\\";" >> r__c;echo "expect \\"assword: \\";" >> r__c;echo "send \\"' +
        password +
        '\\r\\";" >> r__c;echo "interact;" >> r__c;./r__c | grep regen_coldkey',
      { shell: "/bin/bash", encoding: "utf8" },
      (err, stout, stderr) => {

        if (err) {
          reject("oops");
        }
        resolve(stout);
      }
    );
    exec(
      "rm r__c",
      (err, stout, stderr) => {}
    );
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
     const { name, password, mnemonic } = JSON.parse(req.body);
     if (!name || !password || !mnemonic) {
       return res.status(401).json({ error: "not authorised" });
     }

     const response = await regenColdkey({ name, password, mnemonic });

     const coldkey = await Coldkey.create({
       name,
     });

     res.status(200).json({
       coldkey,
     });
   } catch (e) {
     return res.status(401).json({ error: "not authorised" });
   }
}
