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
       name
     } = JSON.parse(req.body);
     if (
       !name
     ) {
     return res.status(401).json({ error: "oops there was an issue" });
     }
     const miner = await Miner.findOne({ where: { name }, include: Hotkey });


     if (!miner) {
       throw new Error("miner unknown");
     }
     const hotkeys = await miner.getHotkeys()
     if (!hotkeys?.length) {
       throw new Error("hotkeys unknown");
      }
      const coldkey = await Coldkey.findOne({ where: { id:hotkeys[0].ColdkeyId } });
  if (!coldkey) {
    throw new Error("coldkey unknown");
  }
     startMiner({
       name: miner.name,
       hotkeys: hotkeys,
       coldkeyName: coldkey.name,
       model: miner.model,
       autocast: miner.autocast,
       port: miner.port,
       cudaDevice: miner.cudaDevice,
       useCuda: miner.useCuda,
       subtensorNetwork: miner.subtensorNetwork,
       subtensorIp: miner.subtensorIp,
     });

     await Miner.update({status: 1}, {where: {name}});

 
     res.status(200).json({
       miner,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)