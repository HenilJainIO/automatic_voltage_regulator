export interface Interlocks {
  tapChangerInProgress: boolean
  tapChangerStuck: boolean
  motorFault: boolean
  manualLock: boolean
}

export interface MasterFollower {
  isMaster: boolean
  isFollower: boolean
  masterId: string | null
  followerIds: string[] | null
}

export interface Transformer {
  id: string
  name: string
  mode: "auto" | "manual"
  status: "normal" | "warning" | "error"
  voltage: number
  tapPosition: number
  voltageBand: {
    lower: number
    upper: number
  }
  voltageSource: "relay" | "mfm"
  interlocks: Interlocks
  masterFollower: MasterFollower | null
}
