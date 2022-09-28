import React from "react";
import { Coldkey, Hotkey, Miner } from "../models";

export const ColdkeyContext = React.createContext<{
    data: typeof Coldkey[],
    setData: (coldkeys: typeof Coldkey[]) => void
}>({
    data: [],
    setData: (coldkeys: typeof Coldkey[]) => {}
})
export const HotkeyContext = React.createContext<{
    data: typeof Hotkey[],
    setData: (hotkeys: typeof Hotkey[]) => void
}>({
    data: [],
    setData: (hotkeys: typeof Hotkey[]) => {}
})
export const MinerContext = React.createContext<{
    data: typeof Miner[],
    setData: (miners: typeof Miner[]) => void
}>({
    data: [],
    setData: (miners: typeof Miner[]) => {}
})
export const ApiContext = React.createContext<{
    api:any
}>({
    api: () => {}
})