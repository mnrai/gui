// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey, Miner } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler, fetchLogs } from "helpers";

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

     const logs = await fetchLogs({
       name: miner.name,
     });


 
     res.status(200).json({
       logs,
     });
   } catch (e) {

     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)