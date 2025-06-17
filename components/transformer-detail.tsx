"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Crown,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Info,
  Wifi,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Transformer } from "@/types/transformer"
import { InterlockStatus } from "@/components/interlock-status"
import { EnhancedVoltageChart } from "@/components/enhanced-voltage-chart"
import { LogExportDialog } from "@/components/log-export-dialog"
import { ExportManager } from "@/utils/export-helpers"
import { TransformerNameChip } from "@/components/transformer-name-chip"

interface TransformerDetailProps {
  transformer: Transformer
  onClose: () => void
  onModeChange: (transformerId: string, mode: "auto" | "manual") => void
  transformers: Transformer[]
}

export function TransformerDetail({ transformer, onClose, onModeChange, transformers }: TransformerDetailProps) {
  const [voltageBand, setVoltageBand] = useState({
    lower: transformer.voltageBand.lower,
    upper: transformer.voltageBand.upper,
  })

  const [showTapChangeExport, setShowTapChangeExport] = useState(false)
  const [showEventExport, setShowEventExport] = useState(false)

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

  // Mock data for tap change log
  const tapChangeLogData = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(),
      action: "Raise",
      fromPosition: 4,
      toPosition: 5,
      mode: "Auto",
      voltageBefore: 218,
      voltageAfter: 222,
      initiatedBy: "AVR System",
      status: "Success",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleString(),
      action: "Lower",
      fromPosition: 5,
      toPosition: 4,
      mode: "Manual",
      voltageBefore: 235,
      voltageAfter: 220,
      initiatedBy: "User: admin",
      status: "Success",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleString(),
      action: "Raise",
      fromPosition: 3,
      toPosition: 4,
      mode: "Auto",
      voltageBefore: 205,
      voltageAfter: 210,
      initiatedBy: "AVR System",
      status: "Failed",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toLocaleString(),
      action: "Raise",
      fromPosition: 3,
      toPosition: 4,
      mode: "Auto",
      voltageBefore: 205,
      voltageAfter: 218,
      initiatedBy: "AVR System",
      status: "Success",
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleString(),
      action: "Lower",
      fromPosition: 6,
      toPosition: 5,
      mode: "Manual",
      voltageBefore: 240,
      voltageAfter: 225,
      initiatedBy: "User: operator1",
      status: "Success",
    },
  ]

  // Mock data for event log
  const eventLogData = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleString(),
      type: "Band Violation",
      severity: "Warning",
      description: "Voltage exceeded upper band limit",
      additionalData: "Voltage: 235V, Upper Limit: 231V",
      acknowledged: false,
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleString(),
      type: "Mode Change",
      severity: "Info",
      description: "Operation mode changed from Manual to Auto",
      additionalData: "Changed by: User admin",
      acknowledged: true,
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleString(),
      type: "Interlock",
      severity: "Critical",
      description: "Tap Changer Stuck interlock activated",
      additionalData: "Motor position feedback lost",
      acknowledged: true,
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleString(),
      type: "Communication",
      severity: "Warning",
      description: "Voltage reference signal lost",
      additionalData: "MFM communication timeout",
      acknowledged: true,
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 22).toLocaleString(),
      type: "System",
      severity: "Info",
      description: "AVR system started",
      additionalData: "System initialization completed",
      acknowledged: true,
    },
  ]

  const handleTapChangeExport = (options: any) => {
    // Filter data based on options and export
    console.log("Exporting tap change log with options:", options)
    if (options.format === "csv") {
      ExportManager.exportTapChangeLogToCSV(tapChangeLogData, transformer.name)
    } else {
      ExportManager.exportTapChangeLogToExcel(tapChangeLogData, transformer.name)
    }
  }

  const handleEventExport = (options: any) => {
    // Filter data based on options and export
    console.log("Exporting event log with options:", options)
    if (options.format === "csv") {
      ExportManager.exportEventLogToCSV(eventLogData, transformer.name)
    } else {
      ExportManager.exportEventLogToExcel(eventLogData, transformer.name)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Transformer Details:</span>
            <TransformerNameChip name={transformer.name} type={transformer.type} maxLength={25} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="space-y-4 pt-4 m-0">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-lg font-medium">Status</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center gap-2">
                        {transformer.status === "normal" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {transformer.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {transformer.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                        <p className="font-medium">
                          {transformer.status.charAt(0).toUpperCase() + transformer.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Type</p>
                      <div className="flex items-center gap-2">
                        {transformer.masterFollower?.isMaster && <Crown className="h-5 w-5 text-yellow-500" />}
                        {transformer.masterFollower?.isFollower && <Users className="h-5 w-5 text-blue-500" />}
                        <div>
                          <p className="font-medium">{transformer.type}</p>
                          {transformer.masterFollower?.isFollower && (
                            <p className="text-xs text-gray-500">
                              Following:{" "}
                              {transformers.find((t) => t.id === transformer.masterFollower?.masterId)?.name ||
                                "Unknown"}
                            </p>
                          )}
                        </div>
                      </div>
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
                <div className="min-h-[300px] max-h-[400px]">
                  <EnhancedVoltageChart voltageBand={transformer.voltageBand} currentVoltage={transformer.voltage} />
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Quick Controls</h3>
                
                {transformer.masterFollower?.isFollower ? (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Follower Mode</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      This transformer is configured as a Follower and automatically follows the settings of its Master
                      transformer. No manual or automatic commands can be issued directly to this transformer.
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Master:{" "}
                      {transformers.find((t) => t.id === transformer.masterFollower?.masterId)?.name || "Unknown"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mode Control */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Operation Mode</h4>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={transformer.mode === "auto" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleModeChange("auto")}
                        >
                          Auto Mode
                        </Button>
                        <Button
                          variant={transformer.mode === "manual" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleModeChange("manual")}
                        >
                          Manual Mode
                        </Button>
                      </div>
                    </div>

                    {/* Manual Control */}
                    {transformer.mode === "manual" && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Manual Tap Control</h4>
                        {transformer.masterFollower?.isMaster && (
                          <div className="mb-3 rounded-md bg-yellow-50 border border-yellow-200 p-3">
                            <p className="text-sm text-yellow-700">
                              <Crown className="inline h-4 w-4 mr-1" />
                              Commands will be replicated to all follower transformers
                            </p>
                          </div>
                        )}
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            Current Tap Position: {transformer.tapPosition} (Range: {transformer.tapLimits.min} -{" "}
                            {transformer.tapLimits.max})
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            onClick={() => handleTapChange("raise")}
                            disabled={hasActiveInterlock || transformer.tapPosition >= transformer.tapLimits.max}
                          >
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Raise Tap
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleTapChange("lower")}
                            disabled={hasActiveInterlock || transformer.tapPosition <= transformer.tapLimits.min}
                          >
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Lower Tap
                          </Button>
                        </div>
                        {hasActiveInterlock && (
                          <p className="mt-2 text-sm text-red-500">Cannot change tap: interlock active</p>
                        )}
                        {transformer.tapPosition >= transformer.tapLimits.max && (
                          <p className="mt-2 text-sm text-orange-500">Cannot raise tap: already at maximum position</p>
                        )}
                        {transformer.tapPosition <= transformer.tapLimits.min && (
                          <p className="mt-2 text-sm text-orange-500">Cannot lower tap: already at minimum position</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="control" className="space-y-4 pt-4 m-0">
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Operation Mode</h3>

                {transformer.masterFollower?.isFollower ? (
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Follower Mode</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      This transformer is configured as a Follower and automatically follows the settings of its Master
                      transformer. No manual or automatic commands can be issued directly to this transformer.
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Master:{" "}
                      {transformers.find((t) => t.id === transformer.masterFollower?.masterId)?.name || "Unknown"}
                    </p>
                  </div>
                ) : transformer.masterFollower?.isMaster ? (
                  <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Master Mode</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      This transformer is configured as a Master and controls its follower transformers. Commands issued
                      to this transformer will be replicated to all followers.
                    </p>
                    {transformer.masterFollower.followerIds && transformer.masterFollower.followerIds.length > 0 && (
                      <p className="text-sm text-yellow-600 mt-2">
                        Followers:{" "}
                        {transformer.masterFollower.followerIds
                          .map((id) => transformers.find((t) => t.id === id)?.name)
                          .join(", ")}
                      </p>
                    )}
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
                  {transformer.masterFollower?.isMaster && (
                    <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
                      <p className="text-sm text-yellow-700">
                        <Crown className="inline h-4 w-4 mr-1" />
                        Commands will be replicated to all follower transformers
                      </p>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Current Tap Position: {transformer.tapPosition} (Range: {transformer.tapLimits.min} -{" "}
                      {transformer.tapLimits.max})
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => handleTapChange("raise")}
                      disabled={hasActiveInterlock || transformer.tapPosition >= transformer.tapLimits.max}
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Raise Tap
                    </Button>
                    <Button
                      onClick={() => handleTapChange("lower")}
                      disabled={hasActiveInterlock || transformer.tapPosition <= transformer.tapLimits.min}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Lower Tap
                    </Button>
                  </div>
                  {hasActiveInterlock && (
                    <p className="mt-2 text-sm text-red-500">Cannot change tap: interlock active</p>
                  )}
                  {transformer.tapPosition >= transformer.tapLimits.max && (
                    <p className="mt-2 text-sm text-orange-500">Cannot raise tap: already at maximum position</p>
                  )}
                  {transformer.tapPosition <= transformer.tapLimits.min && (
                    <p className="mt-2 text-sm text-orange-500">Cannot lower tap: already at minimum position</p>
                  )}
                </div>
              )}

              {transformer.masterFollower?.isFollower && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-lg font-medium text-gray-600">Manual Control</h3>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Manual Control Disabled</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This transformer is in follower mode and cannot be controlled manually. All commands are received
                      from the master transformer.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 pt-4 m-0">
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
                <h3 className="mb-4 text-lg font-medium">Tap Position Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-tap">Minimum Tap Position</Label>
                    <Input id="min-tap" type="number" defaultValue={transformer.tapLimits.min} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-tap">Maximum Tap Position</Label>
                    <Input id="max-tap" type="number" defaultValue={transformer.tapLimits.max} />
                  </div>
                </div>
                <Button className="mt-4">Save Tap Limits</Button>
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

            <TabsContent value="history" className="space-y-4 pt-4 m-0">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Tap Change Log</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTapChangeExport(true)}>
                      Export
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-gray-500">
                        <th className="pb-2">Timestamp</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">From Position</th>
                        <th className="pb-2">To Position</th>
                        <th className="pb-2">Mode</th>
                        <th className="pb-2">Voltage Before</th>
                        <th className="pb-2">Voltage After</th>
                        <th className="pb-2">Initiated By</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tapChangeLogData.map((log, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 text-sm">{log.timestamp}</td>
                          <td className="py-2 text-sm">
                            <div className="flex items-center gap-1">
                              {log.action === "Raise" ? (
                                <ArrowUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-red-600" />
                              )}
                              {log.action}
                            </div>
                          </td>
                          <td className="py-2 text-sm">{log.fromPosition}</td>
                          <td className="py-2 text-sm">{log.toPosition}</td>
                          <td className="py-2 text-sm">{log.mode}</td>
                          <td className="py-2 text-sm">{log.voltageBefore} V</td>
                          <td className="py-2 text-sm">{log.voltageAfter} V</td>
                          <td className="py-2 text-sm">{log.initiatedBy}</td>
                          <td className="py-2 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                log.status === "Success"
                                  ? "bg-green-100 text-green-800"
                                  : log.status === "Failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Event Log</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowEventExport(true)}>
                      Export
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-gray-500">
                        <th className="pb-2">Timestamp</th>
                        <th className="pb-2">Event Type</th>
                        <th className="pb-2">Severity</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Additional Data</th>
                        <th className="pb-2">Acknowledged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventLogData.map((event, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 text-sm">{event.timestamp}</td>
                          <td className="py-2 text-sm">
                            <div className="flex items-center gap-1">
                              {event.type === "Mode Change" && <Settings className="h-3 w-3 text-blue-600" />}
                              {event.type === "Interlock" && <AlertTriangle className="h-3 w-3 text-red-600" />}
                              {event.type === "Band Violation" && (
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              )}
                              {event.type === "System" && <Info className="h-3 w-3 text-gray-600" />}
                              {event.type === "Communication" && <Wifi className="h-3 w-3 text-purple-600" />}
                              {event.type}
                            </div>
                          </td>
                          <td className="py-2 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                event.severity === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : event.severity === "Warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : event.severity === "Info"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {event.severity}
                            </span>
                          </td>
                          <td className="py-2 text-sm">{event.description}</td>
                          <td className="py-2 text-sm">{event.additionalData}</td>
                          <td className="py-2 text-sm">
                            {event.acknowledged ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </div>

          <LogExportDialog
            isOpen={showTapChangeExport}
            onClose={() => setShowTapChangeExport(false)}
            logType="tap-change"
            transformerName={transformer.name}
            onExport={handleTapChangeExport}
          />

          <LogExportDialog
            isOpen={showEventExport}
            onClose={() => setShowEventExport(false)}
            logType="event"
            transformerName={transformer.name}
            onExport={handleEventExport}
          />
        </DialogContent>
      </Dialog>
    )
  }
