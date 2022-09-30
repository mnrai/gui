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
      const { username, password } = JSON.parse(req.body);
      if (!username || !password) {
        return res.status(401).json({ error: "not authorised" });
      }

      const users = await User.findAll();
      if (users.length === 0) {
        const saltRounds = 10;

        const hashed = await bcrypt.hash(password, saltRounds);
        await User.create({
          username,
          password: hashed,
        });
      }
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ error: "not authorised" });
      }

      const comparePW = await bcrypt.compare(password, user.password);

      if (!comparePW) {
        return res.status(401).json({ error: "not authorised" });
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


      const token = jsonwebtoken.sign(
        {
          user: {
            id: user.id,
            username: user.username
          },
        },
        randomStringHash,
        {
          expiresIn: 60*60,
        }
      );
      res.setHeader("Set-Cookie", `Authorization=${token}; HttpOnly;  Secure, Path=/; Domain=.runpod.io`);
      res.status(200).json({ user, comparePW, randomStringHash, token });
    } catch(e) {
          return res.status(401).json({ error: "not authorised" });

    }
}
