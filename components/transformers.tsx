"use client"

import { useState } from "react"
import { TransformerCard } from "@/components/transformer-card"
import { TransformerDetail } from "@/components/transformer-detail"
import { MasterFollowerConfig } from "@/components/master-follower-config"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransformers } from "@/hooks/use-transformers"
import { TransformerTreeView } from "@/components/transformer-tree-view"
import { useToast } from "@/hooks/use-toast"
import { Save, AlertTriangle } from "lucide-react"

export function Transformers() {
  const {
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
  } = useTransformers()
  const [selectedTransformer, setSelectedTransformer] = useState<string | null>(null)
  const [showMasterFollowerConfig, setShowMasterFollowerConfig] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleModeChange = async (transformerId: string, mode: "auto" | "manual") => {
    await updateTransformerMode(transformerId, mode)
  }

  const handleTapChange = async (transformerId: string, direction: "raise" | "lower") => {
    await updateTapPosition(transformerId, direction)
  }

  const handleMasterFollowerChange = (masterId: string, followerIds: string[]) => {
    updateMasterFollower(masterId, followerIds)
    setShowMasterFollowerConfig(false)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await saveChanges()
      toast({
        title: "Changes Saved",
        description: "All transformer configurations have been saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Transformer Management</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
          <Button onClick={() => setShowMasterFollowerConfig(true)} className="w-full sm:w-auto">
            Configure Master-Follower
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to persist your modifications.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="grid" className="mb-8">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {transformers.map((transformer) => (
              <TransformerCard
                key={transformer.id}
                transformer={transformer}
                transformers={transformers}
                onClick={() => setSelectedTransformer(transformer.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <TransformerTreeView transformers={transformers} onTransformerSelect={setSelectedTransformer} />
        </TabsContent>
      </Tabs>

      {selectedTransformer && (
        <TransformerDetail
          transformer={transformers.find((t) => t.id === selectedTransformer)!}
          transformers={transformers}
          onClose={() => setSelectedTransformer(null)}
          onModeChange={handleModeChange}
          onTapChange={handleTapChange}
          modeChangeLoading={modeChangeLoading}
          tapChangeLoading={tapChangeLoading}
          commandDelay={commandDelay}
          onCommandDelayChange={updateCommandDelay}
          getRemainingCooldown={getRemainingCooldown}
        />
      )}

      {showMasterFollowerConfig && (
        <MasterFollowerConfig
          transformers={transformers}
          onClose={() => setShowMasterFollowerConfig(false)}
          onSave={handleMasterFollowerChange}
        />
      )}
    </div>
  )
}
