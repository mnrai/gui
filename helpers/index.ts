// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { exec } from "child_process";
import type { NextApiRequest, NextApiResponse } from "next";
const randomstring = require("randomstring");
const jsonwebtoken = require("jsonwebtoken");
import fs from "node:fs/promises";

type Data = any;

export const authHandler =
  (handler: (req: NextApiRequest, res: NextApiResponse<Data>) => Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    try {
      // @ts-ignore
      const token = req.cookies?.Authorization;

      if (!token) {
        throw Error("invalid");
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
      if (!response || response.exp < +new Date() / 1000) {
        throw Error("invalid");
      }

      await handler(req, res)
    } catch (e) {

      return res.status(401).json({ error: "not authorised" });
    }
  };


  export const startMiner = async ({
    name,
    hotkeyName,
    coldkeyName,
    model,
    autocast,
    port,
    cudaDevice,
    useCuda,
    subtensorNetwork,
    subtensorIp,
  }: {
    name: string;
    hotkeyName: string;
    coldkeyName: string;
    model: string;
    autocast: boolean;
    port: string;
    cudaDevice: number;
    useCuda: boolean;
    subtensorNetwork: string;
    subtensorIp: string;
  }) => {
    return new Promise((resolve, reject) => {
      const options = `--subtensor.network ${subtensorNetwork} --wallet.name ${coldkeyName} ${
        useCuda ? "--subtensor.register.cuda.use_cuda" : ""
      }${useCuda ? ` --subtensor.register.cuda.dev_id ${cudaDevice}` : ""}${
        useCuda ? ` --subtensor.register.cuda.TPB 512` : ""
      }${useCuda ? ` --subtensor.register.cuda.update_interval 70_000` : ""}${
        useCuda ? `` : " --subtensor.register.num_processes 4 "
      } --no_prompt ${
        subtensorIp && subtensorNetwork === "local"
          ? `--subtensor.chain_endpoint ${subtensorIp}:9944 `
          : ""
      }--wallet.hotkey ${hotkeyName} `;
      exec(
        `pm2 start ~/.bittensor/bittensor/bittensor/_neuron/text/core_server/main.py --name ${name} --time --interpreter python3 -- --logging.debug --neuron.model_name ${model}${
          useCuda ? `${autocast ? " --neuron.autocast " : ""}` : ""
        }  --axon.port ${port} --neuron.device ${
          useCuda ? `cuda:${cudaDevice}` : "cpu"
        } ${options}`,
        { shell: "/bin/bash", encoding: "utf8" },
        (err, stout, stderr) => {

          if (err) {
            reject("oops");
          }
          
          resolve(stout);
        }
      );
    });
  };

  export const stopMiner = async ({
    name,
    
  }: {
    name: string;

  }) => {
    return new Promise((resolve, reject) => {
      
      exec(
        `pm2 stop ${name}`,
        { shell: "/bin/bash", encoding: "utf8" },
        (err, stout, stderr) => {

          if (err) {
            reject("oops");
         
          resolve(stout);
        }}
      );
    });
  };
  export const restartMiner = async ({
    name,
    
  }: {
    name: string;

  }) => {
    return new Promise((resolve, reject) => {
      
      exec(
        `pm2 stop ${name} && pm2 start ${name}`,
        { shell: "/bin/bash", encoding: "utf8" },
        (err, stout, stderr) => {

          if (err) {
            reject("oops");
         
          resolve(stout);
        }}
      );
    });
  };
  export const deleteMiner = async ({
    name,
    
  }: {
    name: string;

  }) => {
    return new Promise((resolve, reject) => {
      
      exec(
        `pm2 delete ${name}`,
        { shell: "/bin/bash", encoding: "utf8" },
        (err, stout, stderr) => {

          if (err) {
            reject("oops");
         
          resolve(stout);
        }}
      );
    });
  };
  export const fetchLogs = async ({ name }: { name: string }) => {
    return new Promise((resolve, reject) => {
      exec(
        `pm2 logs ${name} --lines 100 --nostream`,
        { shell: "/bin/bash", encoding: "utf8" },
        (err, stout, stderr) => {

          if (err) {
            reject("oops");

          }
          resolve(stout);
        }
      );
    });
  };