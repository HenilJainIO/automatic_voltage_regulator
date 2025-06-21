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

export interface TapLimits {
  min: number
  max: number
}

export type TransformerType = "Individual" | "Master" | "Follower"

export interface Transformer {
  id: string
  name: string
  mode: "auto" | "manual"
  status: "normal" | "warning" | "error"
  voltage: number
  tapPosition: number
  tapLimits: TapLimits
  voltageBand: {
    lower: number
    upper: number
  }
  voltageSource: "relay" | "mfm"
  interlocks: Interlocks
  masterFollower: MasterFollower | null
  type: TransformerType
}
