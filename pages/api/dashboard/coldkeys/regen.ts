// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

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
  const fileName = path.join(__dirname, "n__c");
  
    exec(
      `echo "#!/usr/bin/expect" > ${fileName};chmod 700 ${fileName};echo "set timeout 20" >> ${fileName};echo "spawn btcli regen_coldkey --no_prompt --wallet.name ${name} --mnemonic ${mnemonic};" >> ${fileName};echo "expect \\"yption: \\";" >> ${fileName};echo "send \\"${password}\\r\\";" >> ${fileName};echo "expect \\"assword: \\";" >> ${fileName};echo "send \\"${password}\\r\\";" >> ${fileName};echo "interact;" >> ${fileName};${fileName} | grep regen_coldkey`,
      { shell: "/bin/bash", encoding: "utf8" },
      (err, stout, stderr) => {
        if (err) {
          reject("oops");
        }
        exec(`rm ${fileName}`, (err, stout, stderr) => {});
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
