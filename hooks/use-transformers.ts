"use client"

import { useState, useCallback } from "react"
import type { Transformer, TransformerType, ToleranceBand } from "@/types/transformer"

// Helper function to determine transformer type
const getTransformerType = (transformer: Partial<Transformer>): TransformerType => {
  if (transformer.masterFollower?.isMaster) return "Master"
  if (transformer.masterFollower?.isFollower) return "Follower"
  return "Individual"
}

// Mock data for transformers - Updated with new fields
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
    toleranceBand: {
      referenceVoltage: 220, // kV
      tolerancePercentage: 2.5,
      lowerLimit: 214.5, // 220 - (220 * 0.025)
      upperLimit: 225.5, // 220 + (220 * 0.025)
    },
    currentRating: {
      ratedCurrent: 1000,
      overCurrentLimit: 800,
      currentValue: 650,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
      tcInRemote: true,
      tcControlSupplyFail: false,
      overCurrent: false,
    },
    masterFollower: null,
    type: "Individual",
    isLive: true,
    voltageSignalValid: true,
  },
  {
    id: "t2",
    name: "Secondary Power Transformer Station 2",
    mode: "manual",
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
    toleranceBand: {
      referenceVoltage: 220,
      tolerancePercentage: 2.5,
      lowerLimit: 214.5,
      upperLimit: 225.5,
    },
    currentRating: {
      ratedCurrent: 1000,
      overCurrentLimit: 800,
      currentValue: 720,
    },
    voltageSource: "mfm",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
      tcInRemote: true,
      tcControlSupplyFail: false,
      overCurrent: false,
    },
    masterFollower: null,
    type: "Individual",
    isLive: true,
    voltageSignalValid: true,
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
    toleranceBand: {
      referenceVoltage: 220,
      tolerancePercentage: 2.5,
      lowerLimit: 214.5,
      upperLimit: 225.5,
    },
    currentRating: {
      ratedCurrent: 1000,
      overCurrentLimit: 800,
      currentValue: 650,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
      tcInRemote: true,
      tcControlSupplyFail: false,
      overCurrent: false,
    },
    masterFollower: null,
    type: "Individual",
    isLive: true,
    voltageSignalValid: true,
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
    toleranceBand: {
      referenceVoltage: 220,
      tolerancePercentage: 2.5,
      lowerLimit: 214.5,
      upperLimit: 225.5,
    },
    currentRating: {
      ratedCurrent: 1000,
      overCurrentLimit: 800,
      currentValue: 900,
    },
    voltageSource: "relay",
    interlocks: {
      tapChangerInProgress: true,
      tapChangerStuck: false,
      motorFault: true,
      manualLock: false,
      tcInRemote: true,
      tcControlSupplyFail: false,
      overCurrent: true,
    },
    masterFollower: null,
    type: "Individual",
    isLive: true,
    voltageSignalValid: true,
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
    toleranceBand: {
      referenceVoltage: 220,
      tolerancePercentage: 2.5,
      lowerLimit: 214.5,
      upperLimit: 225.5,
    },
    currentRating: {
      ratedCurrent: 1000,
      overCurrentLimit: 800,
      currentValue: 750,
    },
    voltageSource: "mfm",
    interlocks: {
      tapChangerInProgress: false,
      tapChangerStuck: false,
      motorFault: false,
      manualLock: false,
      tcInRemote: true,
      tcControlSupplyFail: false,
      overCurrent: false,
    },
    masterFollower: null,
    type: "Individual",
    isLive: true,
    voltageSignalValid: true,
  },
]

// Add helper functions for AVR logic
const calculateToleranceBand = (referenceVoltage: number, tolerancePercentage: number) => {
  const tolerance = referenceVoltage * (tolerancePercentage / 100)
  return {
    lowerLimit: referenceVoltage - tolerance,
    upperLimit: referenceVoltage + tolerance,
  }
}

const checkVoltageInToleranceBand = (voltage: number, toleranceBand: ToleranceBand) => {
  return voltage >= toleranceBand.lowerLimit && voltage <= toleranceBand.upperLimit
}

const checkOverCurrent = (currentValue: number, overCurrentLimit: number) => {
  return currentValue > overCurrentLimit
}

const canIssueCommand = (transformer: Transformer, direction: "raise" | "lower") => {
  // Rule 1: Tap position limits
  if (direction === "lower" && transformer.tapPosition <= transformer.tapLimits.min) {
    return { allowed: false, reason: "Cannot lower tap: already at minimum position" }
  }
  if (direction === "raise" && transformer.tapPosition >= transformer.tapLimits.max) {
    return { allowed: false, reason: "Cannot raise tap: already at maximum position" }
  }

  // Rule 2: Follower in manual mode
  if (transformer.masterFollower?.isFollower && transformer.mode === "manual") {
    return { allowed: false, reason: "Cannot issue command: Follower in manual mode" }
  }

  // Rule 4: TC In Remote check
  if (!transformer.interlocks.tcInRemote) {
    return { allowed: false, reason: "TC In Remote is Low - commands blocked" }
  }

  // Rule 5: TC error conditions
  if (
    transformer.interlocks.tapChangerInProgress ||
    transformer.interlocks.tapChangerStuck ||
    transformer.interlocks.motorFault
  ) {
    return { allowed: false, reason: "TC error/in progress/motor fault - commands blocked" }
  }

  // Rule 6: TC Control Supply Fail
  if (transformer.interlocks.tcControlSupplyFail) {
    return { allowed: false, reason: "TC Control Supply Fail - commands blocked" }
  }

  // Rule 7: Tolerance band check
  const inToleranceBand = checkVoltageInToleranceBand(transformer.voltage, transformer.toleranceBand)
  if (inToleranceBand) {
    return { allowed: false, reason: "Voltage within tolerance band - no command needed" }
  }

  // Rule 8: Overcurrent check (both overcurrent limit and rated current)
  if (
    transformer.interlocks.overCurrent ||
    checkOverCurrent(transformer.currentRating.currentValue, transformer.currentRating.overCurrentLimit) ||
    transformer.currentRating.currentValue > transformer.currentRating.ratedCurrent
  ) {
    return {
      allowed: false,
      reason:
        transformer.currentRating.currentValue > transformer.currentRating.ratedCurrent
          ? `Current exceeds rated value (${transformer.currentRating.currentValue}A > ${transformer.currentRating.ratedCurrent}A)`
          : "Overcurrent condition - commands blocked",
    }
  }

  // Rule 11: Voltage signal validity
  if (!transformer.voltageSignalValid) {
    return { allowed: false, reason: "Invalid voltage signal - commands blocked" }
  }

  return { allowed: true, reason: "" }
}

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

  // Update the updateTapPosition function to include AVR logic
  const updateTapPosition = useCallback(
    async (transformerId: string, direction: "raise" | "lower") => {
      const transformer = transformers.find((t) => t.id === transformerId)
      if (!transformer) return

      // Check if command is allowed based on AVR logic
      const commandCheck = canIssueCommand(transformer, direction)
      if (!commandCheck.allowed) {
        throw new Error(commandCheck.reason)
      }

      // Existing cooldown and loading logic...
      const now = Date.now()
      const lastTime = lastTapChangeTime.get(transformerId) || 0
      const timeSinceLastCommand = now - lastTime

      if (timeSinceLastCommand < commandDelay * 1000) {
        const remainingTime = Math.ceil((commandDelay * 1000 - timeSinceLastCommand) / 1000)
        throw new Error(`Please wait ${remainingTime} more seconds before next command`)
      }

      setTapChangeLoading((prev) => new Set(prev).add(transformerId))

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setTransformers((prev) => {
          const updated = prev.map((t) => {
            if (t.id === transformerId) {
              const currentPosition = t.tapPosition
              let newPosition = currentPosition

              if (direction === "raise" && currentPosition < t.tapLimits.max) {
                newPosition = currentPosition + 1
              } else if (direction === "lower" && currentPosition > t.tapLimits.min) {
                newPosition = currentPosition - 1
              }

              return { ...t, tapPosition: newPosition }
            }
            return t
          })
          setHasUnsavedChanges(true)
          return updated
        })

        setLastTapChangeTime((prev) => new Map(prev).set(transformerId, now))
      } finally {
        setTapChangeLoading((prev) => {
          const newSet = new Set(prev)
          newSet.delete(transformerId)
          return newSet
        })
      }
    },
    [commandDelay, lastTapChangeTime, transformers],
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

  // Add function to update tolerance band
  const updateToleranceBand = useCallback((transformerId: string, tolerancePercentage: number) => {
    if (tolerancePercentage < 0.5 || tolerancePercentage > 5) {
      throw new Error("Tolerance percentage must be between 0.5% and 5%")
    }

    setTransformers((prev) => {
      const updated = prev.map((transformer) => {
        if (transformer.id === transformerId) {
          const { lowerLimit, upperLimit } = calculateToleranceBand(
            transformer.toleranceBand.referenceVoltage,
            tolerancePercentage,
          )
          return {
            ...transformer,
            toleranceBand: {
              ...transformer.toleranceBand,
              tolerancePercentage,
              lowerLimit,
              upperLimit,
            },
          }
        }
        return transformer
      })
      setHasUnsavedChanges(true)
      return updated
    })
  }, [])

  // Add function to update current rating
  const updateCurrentRating = useCallback((transformerId: string, ratedCurrent: number, overCurrentLimit: number) => {
    setTransformers((prev) => {
      const updated = prev.map((transformer) => {
        if (transformer.id === transformerId) {
          return {
            ...transformer,
            currentRating: {
              ...transformer.currentRating,
              ratedCurrent,
              overCurrentLimit,
            },
          }
        }
        return transformer
      })
      setHasUnsavedChanges(true)
      return updated
    })
  }, [])

  // Return the new functions
  return {
    transformers,
    updateTransformerMode,
    updateTapPosition,
    updateMasterFollower,
    updateCommandDelay,
    updateToleranceBand,
    updateCurrentRating,
    saveChanges,
    hasUnsavedChanges,
    modeChangeLoading,
    tapChangeLoading,
    commandDelay,
    getRemainingCooldown,
  }
}
