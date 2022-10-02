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
       hotkeyIds,
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
       !hotkeyIds ||
       !model ||
       !port ||
       cudaDevice === undefined ||
       !useCuda ||
       !subtensorNetwork
     ) {
       
       throw new Error("coldkey unknown");
     }


     const hotkeys = await Promise.all(hotkeyIds.map((hotkeyId:number)=> Hotkey.findOne({ where: { id: hotkeyId } })))

     const hotkey = hotkeys[0];
     if (!hotkey) {
       throw new Error("hotkey unknown");
      }
      const coldkey = await Coldkey.findOne({ where: { id: hotkey?.ColdkeyId } });
      if (!coldkey) {
        throw new Error("coldkey unknown");
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
     miner.addHotkeys(hotkeys);

     startMiner({
       name,
       hotkeys: hotkeys,
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