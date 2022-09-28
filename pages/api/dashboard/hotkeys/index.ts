// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import { authHandler } from "helpers";

import type { NextApiRequest, NextApiResponse } from "next";
import { Coldkey, Hotkey } from "../../../../models";

type Data = any

export default authHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const hotkeys = await Hotkey.findAll({ include: Coldkey });

    res.status(200).json({
      hotkeys,
    });
  } catch (e) {
    return res.status(401).json({ error: "oops, there was a problem" });
  }
});