// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { authHandler } from "helpers";
import {Op} from "sequelize"
import type { NextApiRequest, NextApiResponse } from "next";
import { Coldkey, Hotkey, Miner, Stat, User } from "../../../../models";
import fs from "node:fs/promises";
const randomstring = require("randomstring");
const jsonwebtoken = require("jsonwebtoken");

type Data = any

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

   try {
      const { telegramGroupChatId,telegramBotToken } = JSON.parse(req.body);
      const token = req.cookies?.Authorization;
      let randomStringHash;

   try {
     randomStringHash = await fs.readFile("randomHash", {
       encoding: "utf8",
     });
   } catch (e) {
     randomStringHash = randomstring.generate(24);
     await fs.writeFile("randomHash", randomStringHash, {
       encoding: "utf8",
     });
   }
      const response = jsonwebtoken.verify(token, randomStringHash);
      const isExpired = response.exp < +new Date() / 1000;
    if (!response || isExpired) {
      throw Error("invalid");
    }

      // const user = await User.findOne({ where: { id: response.user.id } });
     await User.update(
       { telegramGroupChatId, telegramBotToken },
       { where: { id: response.user.id } }
     );


    
     res.status(200).json({
       success:true,
     });
   } catch (e) {
     return res.status(401).json({ error: "oops there was an issue" });
   }
}
)