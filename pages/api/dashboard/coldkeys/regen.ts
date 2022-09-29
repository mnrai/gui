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
      `echo "#!/usr/bin/expect" > n__c;chmod 700 n__c;echo "set timeout 20" >> n__c;echo "spawn btcli regen_coldkey --wallet.name ${name} --mnemonic ${mnemonic};" >> n__c;echo "expect \\"yption: \\";" >> n__c;echo "send \\"${password}\\r\\";" >> n__c;echo "expect \\"assword: \\";" >> n__c;echo "send \\"${password}\\r\\";" >> n__c;echo "interact;" >> n__c;./n__c | grep regen_coldkey`,
      { shell: "/bin/bash", encoding: "utf8" },
      (err, stout, stderr) => {

        if (err) {
          reject("oops");
        }
        exec("rm n__c", (err, stout, stderr) => {});
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
     const { name, password, mnemonic } = JSON.parse(req.body);
     if (!name || !password || !mnemonic) {

     return res.status(401).json({ error: "oops, there was a problem" });
     }

     const response = await regenColdkey({ name, password, mnemonic });

     const coldkey = await Coldkey.create({
       name,
     });

     res.status(200).json({
       coldkey,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops, there was a problem" });
   }
}
