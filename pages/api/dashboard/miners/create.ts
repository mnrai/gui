// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey, Miner } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler, startMiner } from "helpers";

type Data = any


export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
     const {
       name,
       hotkeyId,
       model,
       autocast,
       port,
       cudaDevice,
       useCuda,
       subtensorNetwork,
       subtensorIp,
       status
     } = JSON.parse(req.body);
     if (
       !name ||
       !hotkeyId ||
       !model ||
       !port ||
       cudaDevice === undefined ||
       !useCuda ||
       !subtensorNetwork
     ) {
       
       throw new Error("coldkey unknown");
     }

     const hotkey = await Hotkey.findOne({ where: { id: hotkeyId } });
     const coldkey = await Coldkey.findOne({ where: { id: hotkey?.ColdkeyId } });

     if (!coldkey) {
       throw new Error("coldkey unknown");
     }
     if (!hotkey) {
       throw new Error("hotkey unknown");
     }


     const miner = await Miner.create({
       name,
       hotkey,
       model,
       autocast,
       port,
       cudaDevice,
       useCuda,
       subtensorNetwork,
       subtensorIp,
       status,
     });
    // @ts-ignore
     miner.setHotkey(hotkey);

     startMiner({
       name,
       hotkeyName: hotkey.name,
       coldkeyName: coldkey.name,
       model,
       autocast,
       port,
       cudaDevice,
       useCuda,
       subtensorNetwork,
       subtensorIp,
     });
 
     res.status(200).json({
       miner,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)