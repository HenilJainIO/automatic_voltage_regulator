"use client"

import { useState } from "react"
import { TransformerCard } from "@/components/transformer-card"
import { TransformerDetail } from "@/components/transformer-detail"
import { MasterFollowerConfig } from "@/components/master-follower-config"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransformers } from "@/hooks/use-transformers"

export function Transformers() {
  const { transformers, updateTransformerMode, updateMasterFollower } = useTransformers()
  const [selectedTransformer, setSelectedTransformer] = useState<string | null>(null)
  const [showMasterFollowerConfig, setShowMasterFollowerConfig] = useState(false)

  const handleModeChange = (transformerId: string, mode: "auto" | "manual") => {
    updateTransformerMode(transformerId, mode)
  }

  const handleMasterFollowerChange = (masterId: string, followerIds: string[]) => {
    updateMasterFollower(masterId, followerIds)
    setShowMasterFollowerConfig(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Transformer Management</h2>
        <Button onClick={() => setShowMasterFollowerConfig(true)}>Configure Master-Follower</Button>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transformers.map((transformer) => (
              <TransformerCard
                key={transformer.id}
                transformer={transformer}
                onClick={() => setSelectedTransformer(transformer.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <div className="rounded-lg border">
            <div className="grid grid-cols-6 gap-4 border-b bg-gray-50 p-4 font-medium">
              <div>Name</div>
              <div>Mode</div>
              <div>Voltage</div>
              <div>Tap Position</div>
              <div>Status</div>
              <div></div>
            </div>
            {transformers.map((transformer) => (
              <div key={transformer.id} className="grid grid-cols-6 gap-4 border-b p-4 last:border-0">
                <div>{transformer.name}</div>
                <div>
                  {transformer.masterFollower
                    ? transformer.masterFollower.isMaster
                      ? "Master"
                      : "Follower"
                    : transformer.mode}
                </div>
                <div>{transformer.voltage} V</div>
                <div>{transformer.tapPosition}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      transformer.status === "normal"
                        ? "bg-green-100 text-green-800"
                        : transformer.status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transformer.status}
                  </span>
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTransformer(transformer.id)}>
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedTransformer && (
        <TransformerDetail
          transformer={transformers.find((t) => t.id === selectedTransformer)!}
          onClose={() => setSelectedTransformer(null)}
          onModeChange={handleModeChange}
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
