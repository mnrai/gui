// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler } from "helpers";
import path from "path";
import { cmdOptions } from "helpers/cmdOptions";

type Data = any

const newColdkey = async ({name, password}: {name:string,password:string}) => {
return new Promise((resolve, reject)=> {
  const fileName = path.join(__dirname, "n__c")
  exec(
    `echo "#!/usr/bin/expect" > ${fileName};chmod 700 ${fileName};echo "set timeout 20" >> ${fileName};echo "spawn btcli new_coldkey --no_prompt --wallet.name ${(name)};" >> ${fileName};echo "expect \\"yption: \\";" >> ${fileName};echo "send \\"${(password)}\\r\\";" >> ${fileName};echo "expect \\"assword: \\";" >> ${fileName};echo "send \\"${(password)}\\r\\";" >> ${fileName};echo "interact;" >> ${fileName};${fileName} | grep regen_coldkey`,
    {shell:"/bin/bash", encoding:"utf8"},
    (err, stout, stderr) => {

      if(err) {
        reject("oops")
      }
      exec(
        `rm ${fileName}`,
        (err, stout, stderr) => {}
      );
      resolve(stout);
    }
  );
})

}
const routeHandler = async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if(cmdOptions.use_http) {
      throw new Error("cannot be used with http")
    }
    const { name, password } = JSON.parse(req.body);
    if (!name || !password) {
      return res.status(401).json({ error: "oops, there was a problem" });
    }

    const mnemonic = await newColdkey({ name, password });
    const coldkey = await Coldkey.create({
      name,
    });

    res.status(200).json({
      coldkey,
      mnemonic,
    });
  } catch (e) {
    return res.status(401).json({ error: "oops, there was a problem" });
  }
};
export default authHandler(routeHandler);
