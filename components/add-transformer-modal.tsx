"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Trash2 } from "lucide-react"

interface Device {
  id: string
  name: string
  location: string
  type: string
  status: "online" | "offline"
  ratedVoltage: number
  ratedCurrent: number
}

interface AddTransformerModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransformers: (devices: Device[]) => void
}

// Mock device data - in real app this would come from API
const mockDevices: Device[] = [
  {
    id: "dev_001",
    name: "Main Distribution Transformer",
    location: "Substation A",
    type: "Power Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 1000,
  },
  {
    id: "dev_002",
    name: "Backup Distribution Unit",
    location: "Substation A",
    type: "Distribution Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 800,
  },
  {
    id: "dev_003",
    name: "Industrial Feeder T1",
    location: "Substation B",
    type: "Power Transformer",
    status: "offline",
    ratedVoltage: 132,
    ratedCurrent: 1200,
  },
  {
    id: "dev_004",
    name: "Commercial Load T2",
    location: "Substation B",
    type: "Distribution Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 600,
  },
  {
    id: "dev_005",
    name: "Residential Feeder T3",
    location: "Substation C",
    type: "Distribution Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 400,
  },
  {
    id: "dev_006",
    name: "Emergency Backup Unit",
    location: "Substation C",
    type: "Power Transformer",
    status: "offline",
    ratedVoltage: 132,
    ratedCurrent: 1500,
  },
  {
    id: "dev_007",
    name: "Grid Interconnect T4",
    location: "Substation D",
    type: "Power Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 2000,
  },
  {
    id: "dev_008",
    name: "Load Center T5",
    location: "Substation D",
    type: "Distribution Transformer",
    status: "online",
    ratedVoltage: 132,
    ratedCurrent: 900,
  },
]

export function AddTransformerModal({ isOpen, onClose, onAddTransformers }: AddTransformerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([])
  const [/* remove */ /* remove */ ,] = useState(false)

  // Filter devices based on search term
  const filteredDevices = useMemo(() => {
    return mockDevices.filter(
      (device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.type.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  // Handle device selection/deselection
  const handleDeviceToggle = (device: Device, checked: boolean) => {
    if (checked) {
      setSelectedDevices((prev) => [...prev, device])
    } else {
      setSelectedDevices((prev) => prev.filter((d) => d.id !== device.id))
    }
  }

  // Remove device from selected list
  const removeDevice = (deviceId: string) => {
    setSelectedDevices((prev) => prev.filter((d) => d.id !== deviceId))
  }

  // Check if device is selected
  const isDeviceSelected = (deviceId: string) => {
    return selectedDevices.some((d) => d.id === deviceId)
  }

  // Handle adding transformers
  const handleAddTransformers = () => {
    onAddTransformers(selectedDevices)
    setSelectedDevices([])
    setSearchTerm("")
    onClose()
  }

  // Handle modal close
  const handleClose = () => {
    setSelectedDevices([])
    setSearchTerm("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Transformers from Account
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
          {/* Left Side - Device List */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-search">Search Devices</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="device-search"
                  placeholder="Search by name, location, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Device List */}
            <div className="flex-1 border rounded-lg bg-white overflow-hidden">
              <div className="bg-gray-50 border-b p-3">
                <h4 className="text-sm font-medium text-gray-900">Available Devices</h4>
              </div>
              <ScrollArea className="flex-1 h-full">
                <div className="p-2">
                  {filteredDevices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "No devices found matching your search" : "No devices available"}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredDevices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleDeviceToggle(device, !isDeviceSelected(device.id))}
                        >
                          <Checkbox
                            checked={isDeviceSelected(device.id)}
                            onChange={(checked) => handleDeviceToggle(device, checked)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">{device.name}</p>
                              <Badge variant={device.status === "online" ? "default" : "secondary"} className="ml-2">
                                {device.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-gray-500">{device.location}</p>
                              <p className="text-xs text-gray-500">{device.type}</p>
                              <p className="text-xs text-gray-500">
                                {device.ratedVoltage}kV / {device.ratedCurrent}A
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Side - Selected Devices Table */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label>Selected Devices ({selectedDevices.length})</Label>
              {selectedDevices.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDevices([])}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 border-b p-3">
                <h4 className="text-sm font-medium text-gray-900">Selected for Addition</h4>
              </div>

              {selectedDevices.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No devices selected</p>
                    <p className="text-xs mt-1">Select devices from the left to add them here</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 h-full">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-900">Device Name</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-900">Location</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-900">Type</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-900">Status</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-900">Rating</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDevices.map((device, index) => (
                          <tr key={device.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 text-sm text-gray-900 font-medium">{device.name}</td>
                            <td className="p-3 text-sm text-gray-600">{device.location}</td>
                            <td className="p-3 text-sm text-gray-600">{device.type}</td>
                            <td className="p-3">
                              <Badge variant={device.status === "online" ? "default" : "secondary"}>
                                {device.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {device.ratedVoltage}kV / {device.ratedCurrent}A
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDevice(device.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedDevices.length > 0 && (
              <span>
                {selectedDevices.length} device{selectedDevices.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTransformers}
              disabled={selectedDevices.length === 0}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {selectedDevices.length} Transformer{selectedDevices.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
