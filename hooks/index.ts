import { ApiContext, ColdkeyContext, HotkeyContext, MinerContext } from "context";
import React, { useContext } from "react";


export const useColdkeys = () => {
    const { data: coldkeys, setData:setColdkeys} = useContext(ColdkeyContext)

    return {coldkeys,setColdkeys};
}
export const useHotkeys = () => {
    const { data: hotkeys, setData:setHotkeys} = useContext(HotkeyContext)

    return {hotkeys,setHotkeys};
}
export const useMinerData = () => {
    const { data: minerData, setData:setMinerData} = useContext(MinerContext)

    return {minerData,setMinerData};
}
export const useApi = () => {
    const { api} = useContext(ApiContext)

    return api;
}