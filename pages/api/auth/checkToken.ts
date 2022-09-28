import type { NextApiRequest, NextApiResponse } from "next";
import { sequelize, User } from "../../../models";
import fs from "node:fs/promises";
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const jsonwebtoken = require("jsonwebtoken");

type Data = any

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    try {

      const token = req.cookies?.Authorization;
      if(!token){
      return res.status(401).json({ error: "not logged in" });

    }
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
      const isExpired = response.exp <( +new Date() / 1000);

      if (!response || isExpired) {
        throw Error("invalid")
      }
      
      res.status(200).json({
        success: true,
        response,
        dt: +new Date() / 1000,
        isExpired,
      });
      } catch(e) {
            return res.status(401).json({ error: "not authorised" });

      }
}
