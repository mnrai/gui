// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey, Miner } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler, restartMiner } from "helpers";

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

     restartMiner({
       name: miner.name,
     });

     await Miner.update({ status: 1 }, { where: { name } });

 
     res.status(200).json({
       miner,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)