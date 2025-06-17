"use client"

import { useState } from "react"
import { AlertTriangle, ArrowDown, ArrowUp, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Transformer } from "@/types/transformer"
import { VoltageChart } from "@/components/voltage-chart"
import { InterlockStatus } from "@/components/interlock-status"

interface TransformerDetailProps {
  transformer: Transformer
  onClose: () => void
  onModeChange: (transformerId: string, mode: "auto" | "manual") => void
}

export function TransformerDetail({ transformer, onClose, onModeChange }: TransformerDetailProps) {
  const [voltageBand, setVoltageBand] = useState({
    lower: transformer.voltageBand.lower,
    upper: transformer.voltageBand.upper,
  })

  const handleVoltageBandChange = () => {
    // In a real app, this would update the transformer's voltage band
    console.log("Updating voltage band:", voltageBand)
  }

  const handleModeChange = (mode: "auto" | "manual") => {
    onModeChange(transformer.id, mode)
  }

  const handleTapChange = (direction: "raise" | "lower") => {
    // Check interlocks before allowing tap change
    if (Object.values(transformer.interlocks).some((value) => value)) {
      console.log("Cannot change tap: interlock active")
      return
    }

    // In a real app, this would send a command to raise or lower the tap
    console.log(`${direction === "raise" ? "Raising" : "Lowering"} tap for transformer ${transformer.id}`)
  }

  const isInBand =
    transformer.voltage >= transformer.voltageBand.lower && transformer.voltage <= transformer.voltageBand.upper

  const hasActiveInterlock = Object.values(transformer.interlocks).some((value) => value)

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transformer Details: {transformer.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Status</h3>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Mode</p>
                    <p className="font-medium">
                      {transformer.masterFollower
                        ? transformer.masterFollower.isMaster
                          ? "Master"
                          : `Follower (of ${transformer.masterFollower.masterId})`
                        : transformer.mode.charAt(0).toUpperCase() + transformer.mode.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tap Position</p>
                    <p className="font-medium">{transformer.tapPosition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Voltage</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{transformer.voltage} V</p>
                      {!isInBand && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Band</p>
                    <p className="font-medium">
                      {transformer.voltageBand.lower} - {transformer.voltageBand.upper} V
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Interlocks</h3>
                <InterlockStatus interlocks={transformer.interlocks} />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Voltage Trend</h3>
              <VoltageChart voltageBand={transformer.voltageBand} currentVoltage={transformer.voltage} />
            </div>
          </TabsContent>

          <TabsContent value="control" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Operation Mode</h3>

              {transformer.masterFollower ? (
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    {transformer.masterFollower.isMaster
                      ? "This transformer is configured as a Master and controls its followers."
                      : "This transformer is configured as a Follower and follows its master's settings."}
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    variant={transformer.mode === "auto" ? "default" : "outline"}
                    onClick={() => handleModeChange("auto")}
                  >
                    Auto Mode
                  </Button>
                  <Button
                    variant={transformer.mode === "manual" ? "default" : "outline"}
                    onClick={() => handleModeChange("manual")}
                  >
                    Manual Mode
                  </Button>
                </div>
              )}
            </div>

            {transformer.mode === "manual" && !transformer.masterFollower?.isFollower && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Manual Control</h3>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => handleTapChange("raise")} disabled={hasActiveInterlock}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Raise Tap
                  </Button>
                  <Button onClick={() => handleTapChange("lower")} disabled={hasActiveInterlock}>
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Lower Tap
                  </Button>
                </div>
                {hasActiveInterlock && <p className="mt-2 text-sm text-red-500">Cannot change tap: interlock active</p>}
              </div>
            )}

            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Current Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Voltage:</span>
                  <span className="font-medium">{transformer.voltage} V</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voltage Band:</span>
                  <span className="font-medium">
                    {transformer.voltageBand.lower} - {transformer.voltageBand.upper} V
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Band Status:</span>
                  <span className={`font-medium ${isInBand ? "text-green-600" : "text-red-600"}`}>
                    {isInBand ? "Within Band" : "Outside Band"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tap Position:</span>
                  <span className="font-medium">{transformer.tapPosition}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Voltage Band Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lower-band">Lower Band (V)</Label>
                  <Input
                    id="lower-band"
                    type="number"
                    value={voltageBand.lower}
                    onChange={(e) => setVoltageBand({ ...voltageBand, lower: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upper-band">Upper Band (V)</Label>
                  <Input
                    id="upper-band"
                    type="number"
                    value={voltageBand.upper}
                    onChange={(e) => setVoltageBand({ ...voltageBand, upper: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleVoltageBandChange}>
                Save Band Settings
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Voltage Reference Source</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="relay"
                    name="voltage-source"
                    defaultChecked={transformer.voltageSource === "relay"}
                  />
                  <Label htmlFor="relay">Relay</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mfm"
                    name="voltage-source"
                    defaultChecked={transformer.voltageSource === "mfm"}
                  />
                  <Label htmlFor="mfm">MFM Meter</Label>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Command Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min-delay">Minimum Delay Between Commands (seconds)</Label>
                  <Input id="min-delay" type="number" className="w-24" defaultValue="11" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="log-commands" defaultChecked />
                  <Label htmlFor="log-commands">Log All Tap Change Commands</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Tap Change History</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Mode</th>
                      <th className="pb-2">Voltage</th>
                      <th className="pb-2">Tap Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 text-sm">{new Date(Date.now() - i * 1000 * 60 * 5).toLocaleString()}</td>
                        <td className="py-2 text-sm">{i % 2 === 0 ? "Tap Raise" : "Tap Lower"}</td>
                        <td className="py-2 text-sm">{i % 3 === 0 ? "Manual" : "Auto"}</td>
                        <td className="py-2 text-sm">{220 + Math.floor(Math.random() * 10 - 5)} V</td>
                        <td className="py-2 text-sm">{5 + (i % 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-medium">Event Log</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Event</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 text-sm">{new Date(Date.now() - i * 1000 * 60 * 15).toLocaleString()}</td>
                        <td className="py-2 text-sm">
                          {i % 4 === 0
                            ? "Mode Change"
                            : i % 4 === 1
                              ? "Interlock Active"
                              : i % 4 === 2
                                ? "Band Violation"
                                : "Tap Change"}
                        </td>
                        <td className="py-2 text-sm">
                          {i % 4 === 0
                            ? "Mode changed to Auto"
                            : i % 4 === 1
                              ? "Tap Changer Stuck interlock activated"
                              : i % 4 === 2
                                ? "Voltage outside band: 235V"
                                : "Tap position changed to 6"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
