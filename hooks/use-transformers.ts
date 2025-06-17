"use client"

import { useState, useCallback } from "react"
import type { Transformer, TransformerType } from "@/types/transformer"

// Helper function to determine transformer type
const getTransformerType = (transformer: Partial<Transformer>): TransformerType => {
  if (transformer.masterFollower?.isMaster) return "Master"
  if (transformer.masterFollower?.isFollower) return "Follower"
  return "Individual"
}

// Mock data for transformers
const initialTransformers: Transformer[] = [
  {
    id: "t1",
    name: "Main Distribution Transformer Unit 1",
    mode: "auto",
    status: "normal",
    voltage: 220,
    tapPosition: 5,
    tapLimits: {
      min: 1,
      max: 10,
    },
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
    type: "Individual",
  },
  {
    id: "t2",
    name: "Secondary Power Transformer Station 2",
    mode: "manual",
    status: "warning",
    voltage: 235,
    tapPosition: 9,
    tapLimits: {
      min: 1,
      max: 10,
    },
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
    type: "Individual",
  },
  {
    id: "t3",
    name: "Industrial Complex Transformer 3",
    mode: "auto",
    status: "normal",
    voltage: 218,
    tapPosition: 4,
    tapLimits: {
      min: 1,
      max: 12,
    },
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
    type: "Individual",
  },
  {
    id: "t4",
    name: "Emergency Backup Transformer Unit 4",
    mode: "auto",
    status: "error",
    voltage: 205,
    tapPosition: 1,
    tapLimits: {
      min: 1,
      max: 8,
    },
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
    type: "Individual",
  },
  {
    id: "t5",
    name: "Commercial District Transformer 5",
    mode: "manual",
    status: "normal",
    voltage: 225,
    tapPosition: 6,
    tapLimits: {
      min: 1,
      max: 10,
    },
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
    type: "Individual",
  },
]

export function useTransformers() {
  const [transformers, setTransformers] = useState<Transformer[]>(initialTransformers)
  const [savedTransformers, setSavedTransformers] = useState<Transformer[]>(initialTransformers)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateTransformerMode = useCallback((transformerId: string, mode: "auto" | "manual") => {
    setTransformers((prev) => {
      const updated = prev.map((transformer) =>
        transformer.id === transformerId ? { ...transformer, mode } : transformer,
      )
      setHasUnsavedChanges(true)
      return updated
    })
  }, [])

  const updateMasterFollower = useCallback((masterId: string, followerIds: string[]) => {
    setTransformers((prev) => {
      const updated = prev.map((transformer) => {
        if (transformer.id === masterId) {
          const updatedTransformer = {
            ...transformer,
            masterFollower: {
              isMaster: true,
              isFollower: false,
              masterId: null,
              followerIds,
            },
          }
          return {
            ...updatedTransformer,
            type: getTransformerType(updatedTransformer),
          }
        } else if (followerIds.includes(transformer.id)) {
          const updatedTransformer = {
            ...transformer,
            masterFollower: {
              isMaster: false,
              isFollower: true,
              masterId,
              followerIds: null,
            },
          }
          return {
            ...updatedTransformer,
            type: getTransformerType(updatedTransformer),
          }
        } else {
          const updatedTransformer = {
            ...transformer,
            masterFollower: null,
          }
          return {
            ...updatedTransformer,
            type: getTransformerType(updatedTransformer),
          }
        }
      })
      setHasUnsavedChanges(true)
      return updated
    })
  }, [])

  const saveChanges = useCallback(async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would make an API call to save the data
    setSavedTransformers([...transformers])
    setHasUnsavedChanges(false)

    console.log("Saved transformer configurations:", transformers)
  }, [transformers])

  return {
    transformers,
    updateTransformerMode,
    updateMasterFollower,
    saveChanges,
    hasUnsavedChanges,
  }
}
