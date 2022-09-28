// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { Coldkey, Hotkey } from "../../../../models";
import type { NextApiRequest, NextApiResponse } from "next";
import { authHandler } from "helpers";

type Data = any

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const coldkeys = await Coldkey.findAll();

    res.status(200).json({
      coldkeys,
    });
  } catch (e) {
    return res.status(401).json({ error: "not authorised" });
  }
});