"use client"

import { Activity, AlertTriangle, Check, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransformerNameChip } from "@/components/transformer-name-chip"
import type { Transformer } from "@/types/transformer"

interface TransformerCardProps {
  transformer: Transformer
  transformers: Transformer[]
  onClick: () => void
}

export function TransformerCard({ transformer, transformers, onClick }: TransformerCardProps) {
  const isInBand =
    transformer.voltage >= transformer.voltageBand.lower && transformer.voltage <= transformer.voltageBand.upper

  const hasActiveInterlock = Object.values(transformer.interlocks).some((value) => value)

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md w-full" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <TransformerNameChip name={transformer.name} type={transformer.type} maxLength={15} className="flex-1" />
          <div className="flex justify-start sm:justify-end">
            <Badge
              variant={
                transformer.status === "normal"
                  ? "success"
                  : transformer.status === "warning"
                    ? "warning"
                    : "destructive"
              }
              className="flex items-center gap-1 flex-shrink-0"
            >
              {transformer.status === "normal" && <CheckCircle className="h-3 w-3" />}
              {transformer.status === "warning" && <AlertTriangle className="h-3 w-3" />}
              {transformer.status === "error" && <XCircle className="h-3 w-3" />}
              {transformer.status.charAt(0).toUpperCase() + transformer.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Mode</p>
            <p className="font-medium">
              {transformer.masterFollower
                ? transformer.masterFollower.isMaster
                  ? "Master"
                  : "Follower"
                : transformer.mode.charAt(0).toUpperCase() + transformer.mode.slice(1)}
            </p>
            {transformer.masterFollower?.isFollower && (
              <p className="text-xs text-gray-400">
                Following: {transformers.find((t) => t.id === transformer.masterFollower?.masterId)?.name || "Unknown"}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Tap Position</p>
            <p className="font-medium">{transformer.tapPosition}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Voltage</p>
            <div className="flex items-center gap-1">
              <p className="font-medium">{transformer.voltage} V</p>
              {!isInBand && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Band</p>
            <p className="font-medium">
              {transformer.voltageBand.lower} - {transformer.voltageBand.upper} V
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">Last tap change: 5m ago</span>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveInterlock ? (
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            ) : (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            <span className="text-sm text-gray-600">{hasActiveInterlock ? "Interlock active" : "Ready"}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
