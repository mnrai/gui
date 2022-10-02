import type { NextApiRequest, NextApiResponse } from "next";

type Data = any

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    try {
      res.setHeader("Set-Cookie", `Authorization="";HttpOnly;Secure;Path=/;Expires=${60*60}`);
      res.status(200).json({ success:true });
    } catch(e) {
          return res.status(401).json({ error: "not authorised" });

    }
}
