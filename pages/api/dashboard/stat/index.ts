// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { authHandler } from "helpers";
import {Op} from "sequelize"
import type { NextApiRequest, NextApiResponse } from "next";
import { Coldkey, Hotkey, Miner, Stat } from "../../../../models";

type Data = any

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
  
     const data = await Stat.findAll({ where: {createdAt: {
      [Op.gt]: new Date(+new Date()-1000*60*60*24*14)
     }}, include: Coldkey})

     res.status(200).json({
       data,
     });
   } catch (e) {
     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)