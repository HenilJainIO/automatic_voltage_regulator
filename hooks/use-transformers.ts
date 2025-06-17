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
  const [modeChangeLoading, setModeChangeLoading] = useState<Set<string>>(new Set())
  const [tapChangeLoading, setTapChangeLoading] = useState<Set<string>>(new Set())
  const [lastTapChangeTime, setLastTapChangeTime] = useState<Map<string, number>>(new Map())
  const [commandDelay, setCommandDelay] = useState(11) // Default 11 seconds

  const updateTransformerMode = useCallback(async (transformerId: string, mode: "auto" | "manual") => {
    // Set loading state
    setModeChangeLoading((prev) => new Set(prev).add(transformerId))

    try {
      // 5 second delay for mode change
      await new Promise((resolve) => setTimeout(resolve, 5000))

      setTransformers((prev) => {
        const updated = prev.map((transformer) =>
          transformer.id === transformerId ? { ...transformer, mode } : transformer,
        )
        setHasUnsavedChanges(true)
        return updated
      })
    } finally {
      // Remove loading state
      setModeChangeLoading((prev) => {
        const newSet = new Set(prev)
        newSet.delete(transformerId)
        return newSet
      })
    }
  }, [])

  const updateTapPosition = useCallback(
    async (transformerId: string, direction: "raise" | "lower") => {
      const now = Date.now()
      const lastTime = lastTapChangeTime.get(transformerId) || 0
      const timeSinceLastCommand = now - lastTime

      // Check if enough time has passed since last command
      if (timeSinceLastCommand < commandDelay * 1000) {
        const remainingTime = Math.ceil((commandDelay * 1000 - timeSinceLastCommand) / 1000)
        throw new Error(`Please wait ${remainingTime} more seconds before next command`)
      }

      // Set loading state
      setTapChangeLoading((prev) => new Set(prev).add(transformerId))

      try {
        // Simulate command execution time (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setTransformers((prev) => {
          const updated = prev.map((transformer) => {
            if (transformer.id === transformerId) {
              const currentPosition = transformer.tapPosition
              let newPosition = currentPosition

              if (direction === "raise" && currentPosition < transformer.tapLimits.max) {
                newPosition = currentPosition + 1
              } else if (direction === "lower" && currentPosition > transformer.tapLimits.min) {
                newPosition = currentPosition - 1
              }

              return { ...transformer, tapPosition: newPosition }
            }
            return transformer
          })
          setHasUnsavedChanges(true)
          return updated
        })

        // Update last command time
        setLastTapChangeTime((prev) => new Map(prev).set(transformerId, now))
      } finally {
        // Remove loading state
        setTapChangeLoading((prev) => {
          const newSet = new Set(prev)
          newSet.delete(transformerId)
          return newSet
        })
      }
    },
    [commandDelay, lastTapChangeTime],
  )

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

  const updateCommandDelay = useCallback((newDelay: number) => {
    if (newDelay >= 11) {
      setCommandDelay(newDelay)
      setHasUnsavedChanges(true)
    }
  }, [])

  const getRemainingCooldown = useCallback(
    (transformerId: string) => {
      const now = Date.now()
      const lastTime = lastTapChangeTime.get(transformerId) || 0
      const timeSinceLastCommand = now - lastTime
      const remainingTime = Math.max(0, commandDelay * 1000 - timeSinceLastCommand)
      return Math.ceil(remainingTime / 1000)
    },
    [commandDelay, lastTapChangeTime],
  )

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
    updateTapPosition,
    updateMasterFollower,
    updateCommandDelay,
    saveChanges,
    hasUnsavedChanges,
    modeChangeLoading,
    tapChangeLoading,
    commandDelay,
    getRemainingCooldown,
  }
}
