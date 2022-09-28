// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler } from "helpers";

type Data = any

const newColdkey = async ({name, password}: {name:string,password:string}) => {
return new Promise((resolve, reject)=> {

  exec(
    'echo "#!/usr/bin/expect" > n__c;chmod 700 n__c;echo "set timeout 20" >> n__c;echo "spawn btcli new_coldkey --wallet.name '+name+';" >> n__c;echo "expect \\"yption: \\";" >> n__c;echo "send \\"'+password+'\\r\\";" >> n__c;echo "expect \\"assword: \\";" >> n__c;echo "send \\"'+password+'\\r\\";" >> n__c;echo "interact;" >> n__c;./n__c | grep regen_coldkey',
    {shell:"/bin/bash", encoding:"utf8"},
    (err, stout, stderr) => {

      if(err) {
        reject("oops")
      }
      exec(
        "rm n__c",
        (err, stout, stderr) => {}
      );
      resolve(stout);
    }
  );
})

}

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
     const { name, password } = JSON.parse(req.body);
     if (!name || !password) {
       return res.status(401).json({ error: "not authorised" });
     }

     const mnemonic = await newColdkey({name, password})
     const coldkey = await Coldkey.create({
      name,
     })
 
     res.status(200).json({
      coldkey,
       mnemonic,
     });
   } catch (e) {
     return res.status(401).json({ error: "not authorised" });
   }
})
