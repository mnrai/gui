import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { ApiContext, ColdkeyContext, HotkeyContext, MinerContext } from "../context";
import { Coldkey, Hotkey, Miner } from '../models'
import { Api } from '../api';
import { useRouter } from 'next/router';


function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [coldkeys, setColdkeys] = useState<typeof Coldkey[]>([])
  const [hotkeys, setHotkeys] = useState<typeof Hotkey[]>([])
  const [miners, setMiners] = useState<typeof Miner[]>([])

  return (
    <ApiContext.Provider
      value={{
        api: Api(()=>{
          router.push("/")
        })
      }}
    >
    <ColdkeyContext.Provider
      value={{
        data: coldkeys,
        setData: setColdkeys,
      }}
    >
    <HotkeyContext.Provider
      value={{
        data: hotkeys,
        setData: setHotkeys,
      }}
    >
    <MinerContext.Provider
      value={{
        data: miners,
        setData: setMiners,
      }}
    >
      <Component {...pageProps} />
    </MinerContext.Provider>
    </HotkeyContext.Provider>
    </ColdkeyContext.Provider>
    </ApiContext.Provider>
  );
}

export default MyApp
