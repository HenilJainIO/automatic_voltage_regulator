"use client"

import { Activity, AlertTriangle, Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transformer } from "@/types/transformer"

interface TransformerCardProps {
  transformer: Transformer
  onClick: () => void
}

export function TransformerCard({ transformer, onClick }: TransformerCardProps) {
  const isInBand =
    transformer.voltage >= transformer.voltageBand.lower && transformer.voltage <= transformer.voltageBand.upper

  const hasActiveInterlock = Object.values(transformer.interlocks).some((value) => value)

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{transformer.name}</CardTitle>
          <Badge
            variant={
              transformer.status === "normal" ? "success" : transformer.status === "warning" ? "warning" : "destructive"
            }
          >
            {transformer.status}
          </Badge>
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
                  : `Follower (of ${transformer.masterFollower.masterId})`
                : transformer.mode.charAt(0).toUpperCase() + transformer.mode.slice(1)}
            </p>
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
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Last tap change: 5m ago</span>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveInterlock ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm text-gray-600">{hasActiveInterlock ? "Interlock active" : "Ready"}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
