"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Transformer } from "@/types/transformer"
import { X } from "lucide-react"

interface MasterFollowerConfigProps {
  transformers: Transformer[]
  onClose: () => void
  onSave: (masterId: string, followerIds: string[]) => void
}

export function MasterFollowerConfig({ transformers, onClose, onSave }: MasterFollowerConfigProps) {
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null)
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([])
  const [standaloneTransformers, setStandaloneTransformers] = useState<string[]>(
    transformers.filter((t) => !t.masterFollower).map((t) => t.id),
  )

  const handleMasterSelect = (transformerId: string) => {
    if (selectedMaster === transformerId) {
      setSelectedMaster(null)
      setStandaloneTransformers([...standaloneTransformers, transformerId])
    } else {
      if (selectedMaster) {
        setStandaloneTransformers([...standaloneTransformers, selectedMaster])
      }
      setSelectedMaster(transformerId)
      setStandaloneTransformers(standaloneTransformers.filter((id) => id !== transformerId))

      // If this transformer was a follower, remove it from followers
      if (selectedFollowers.includes(transformerId)) {
        setSelectedFollowers(selectedFollowers.filter((id) => id !== transformerId))
      }
    }
  }

  const handleFollowerSelect = (transformerId: string) => {
    if (selectedFollowers.includes(transformerId)) {
      setSelectedFollowers(selectedFollowers.filter((id) => id !== transformerId))
      setStandaloneTransformers([...standaloneTransformers, transformerId])
    } else {
      setSelectedFollowers([...selectedFollowers, transformerId])
      setStandaloneTransformers(standaloneTransformers.filter((id) => id !== transformerId))

      // If this transformer was the master, remove it from master
      if (selectedMaster === transformerId) {
        setSelectedMaster(null)
      }
    }
  }

  const handleSave = () => {
    if (selectedMaster) {
      onSave(selectedMaster, selectedFollowers)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Configure Master-Follower Relationship</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-medium">Instructions</h3>
            <p className="text-sm text-gray-600">
              Select one transformer to act as the Master. Then select which transformers will follow the Master's
              settings. Any transformers not selected will operate as standalone units.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Master Transformer</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {transformers.map((transformer) => (
                <div
                  key={transformer.id}
                  className={`cursor-pointer rounded-md border p-3 ${
                    selectedMaster === transformer.id
                      ? "border-blue-500 bg-blue-50"
                      : selectedFollowers.includes(transformer.id)
                        ? "opacity-50"
                        : ""
                  }`}
                  onClick={() => handleMasterSelect(transformer.id)}
                >
                  <p className="font-medium">{transformer.name}</p>
                  <p className="text-sm text-gray-600">Current Mode: {transformer.mode}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Follower Transformers</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {transformers.map((transformer) => (
                <div
                  key={transformer.id}
                  className={`cursor-pointer rounded-md border p-3 ${
                    selectedFollowers.includes(transformer.id)
                      ? "border-green-500 bg-green-50"
                      : selectedMaster === transformer.id
                        ? "opacity-50"
                        : ""
                  }`}
                  onClick={() => handleFollowerSelect(transformer.id)}
                >
                  <p className="font-medium">{transformer.name}</p>
                  <p className="text-sm text-gray-600">Current Mode: {transformer.mode}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Configuration Summary</h3>
            <div className="rounded-md bg-gray-50 p-4">
              <div className="mb-2">
                <p className="font-medium">Master:</p>
                <p className="text-sm">
                  {selectedMaster ? transformers.find((t) => t.id === selectedMaster)?.name : "No master selected"}
                </p>
              </div>
              <div className="mb-2">
                <p className="font-medium">Followers:</p>
                <p className="text-sm">
                  {selectedFollowers.length > 0
                    ? selectedFollowers.map((id) => transformers.find((t) => t.id === id)?.name).join(", ")
                    : "No followers selected"}
                </p>
              </div>
              <div>
                <p className="font-medium">Standalone Transformers:</p>
                <p className="text-sm">
                  {standaloneTransformers.length > 0
                    ? standaloneTransformers.map((id) => transformers.find((t) => t.id === id)?.name).join(", ")
                    : "No standalone transformers"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedMaster}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
