"use client"

import { useState } from "react"
import type { Transformer } from "@/types/transformer"

// Mock data for transformers
const initialTransformers: Transformer[] = [
  {
    id: "t1",
    name: "Transformer 1",
    mode: "auto",
    status: "normal",
    voltage: 220,
    tapPosition: 5,
    voltageBand: {
      lower: 209,
      upper: 231,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
    },
    masterFollower: null,
  },
  {
    id: "t2",
    name: "Transformer 2",
    mode: "manual",
    status: "warning",
    voltage: 235,
    tapPosition: 7,
    voltageBand: {
      lower: 209,
      upper: 231,
    },
    voltageSource: "mfm",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: true,
      motorFault: false,
      manualLock: false,
    },
    masterFollower: null,
  },
  {
    id: "t3",
    name: "Transformer 3",
    mode: "auto",
    status: "normal",
    voltage: 218,
    tapPosition: 4,
    voltageBand: {
      lower: 209,
      upper: 231,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
    },
    masterFollower: null,
  },
  {
    id: "t4",
    name: "Transformer 4",
    mode: "auto",
    status: "error",
    voltage: 205,
    tapPosition: 3,
    voltageBand: {
      lower: 209,
      upper: 231,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: true,
      tapChangerStuck: false,
      motorFault: true,
      manualLock: false,
    },
    masterFollower: null,
  },
  {
    id: "t5",
    name: "Transformer 5",
    mode: "manual",
    status: "normal",
    voltage: 225,
    tapPosition: 6,
    voltageBand: {
      lower: 209,
      upper: 231,
    },
    voltageSource: "mfm",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
    },
    masterFollower: null,
  },
]

export function useTransformers() {
  const [transformers, setTransformers] = useState<Transformer[]>(initialTransformers)

  const updateTransformerMode = (transformerId: string, mode: "auto" | "manual") => {
    setTransformers((prev) =>
      prev.map((transformer) => (transformer.id === transformerId ? { ...transformer, mode } : transformer)),
    )
  }

  const updateMasterFollower = (masterId: string, followerIds: string[]) => {
    setTransformers((prev) =>
      prev.map((transformer) => {
        if (transformer.id === masterId) {
          return {
            ...transformer,
            masterFollower: {
              isMaster: true,
              isFollower: false,
              masterId: null,
              followerIds,
            },
          }
        } else if (followerIds.includes(transformer.id)) {
          return {
            ...transformer,
            masterFollower: {
              isMaster: false,
              isFollower: true,
              masterId,
              followerIds: null,
            },
          }
        } else {
          return {
            ...transformer,
            masterFollower: null,
          }
        }
      }),
    )
  }

  return {
    transformers,
    updateTransformerMode,
    updateMasterFollower,
  }
}
