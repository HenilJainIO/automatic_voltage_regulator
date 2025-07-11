"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface TapChangeEvent {
  time: string
  direction: "raise" | "lower"
  tapPosition: number
  annotation?: string
}

interface EnhancedVoltageChartProps {
  voltageBand: {
    lower: number
    upper: number
  }
  currentVoltage: number
}

export function EnhancedVoltageChart({ voltageBand, currentVoltage }: EnhancedVoltageChartProps) {
  const [voltageData, setVoltageData] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [tapChangeEvents, setTapChangeEvents] = useState<TapChangeEvent[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h")
  const [customStartTime, setCustomStartTime] = useState("")
  const [customEndTime, setCustomEndTime] = useState("")
  const [showAnnotationDialog, setShowAnnotationDialog] = useState<number | null>(null)
  const [annotationText, setAnnotationText] = useState("")

  useEffect(() => {
    generateHistoricalData()
  }, [selectedTimeRange, customStartTime, customEndTime])

  const generateHistoricalData = () => {
    const now = new Date()
    let startTime: Date
    let dataPoints: number

    if (selectedTimeRange === "custom" && customStartTime && customEndTime) {
      startTime = new Date(customStartTime)
      const endTime = new Date(customEndTime)
      const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      dataPoints = Math.min(Math.max(Math.floor(diffHours * 12), 10), 200) // 12 points per hour, max 200
    } else {
      const ranges = {
        "1h": { hours: 1, points: 60 },
        "6h": { hours: 6, points: 72 },
        "24h": { hours: 24, points: 96 },
        "7d": { hours: 168, points: 168 },
      }
      const range = ranges[selectedTimeRange as keyof typeof ranges] || ranges["1h"]
      startTime = new Date(now.getTime() - range.hours * 60 * 60 * 1000)
      dataPoints = range.points
    }

    const newLabels = []
    const newData = []
    const newTapEvents: TapChangeEvent[] = []

    const interval = (now.getTime() - startTime.getTime()) / dataPoints

    for (let i = 0; i <= dataPoints; i++) {
      const time = new Date(startTime.getTime() + i * interval)
      newLabels.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

      // Generate voltage data with some variation
      const baseVoltage = currentVoltage
      const variation = Math.random() * 15 - 7.5
      newData.push(baseVoltage + variation)

      // Randomly generate tap change events (about 5% chance per data point)
      if (Math.random() < 0.05 && i > 0) {
        newTapEvents.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          direction: Math.random() > 0.5 ? "raise" : "lower",
          tapPosition: Math.floor(Math.random() * 10) + 1,
        })
      }
    }

    setLabels(newLabels)
    setVoltageData(newData)
    setTapChangeEvents(newTapEvents)
  }

  const addAnnotation = (eventIndex: number) => {
    if (annotationText.trim()) {
      setTapChangeEvents((prev) =>
        prev.map((event, index) => (index === eventIndex ? { ...event, annotation: annotationText.trim() } : event)),
      )
      setAnnotationText("")
      setShowAnnotationDialog(null)
    }
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Voltage",
        data: voltageData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
      {
        label: "Upper Band",
        data: Array(labels.length).fill(voltageBand.upper),
        borderColor: "rgba(255, 99, 132, 0.7)",
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Lower Band",
        data: Array(labels.length).fill(voltageBand.lower),
        borderColor: "rgba(255, 99, 132, 0.7)",
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          afterBody: (context: any) => {
            const dataIndex = context[0].dataIndex
            const timeLabel = labels[dataIndex]
            const tapEvent = tapChangeEvents.find((event) => event.time === timeLabel)
            if (tapEvent) {
              return [
                `Tap ${tapEvent.direction}: Position ${tapEvent.tapPosition}`,
                tapEvent.annotation ? `Note: ${tapEvent.annotation}` : "",
              ].filter(Boolean)
            }
            return []
          },
        },
      },
    },
    scales: {
      y: {
        min: Math.min(voltageBand.lower - 15, Math.min(...voltageData) - 5),
        max: Math.max(voltageBand.upper + 15, Math.max(...voltageData) + 5),
      },
    },
  }

  return (
    <div className="space-y-4">
      {/* Time Range Controls */}
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {["1h", "6h", "24h", "7d"].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
              className="min-w-[60px] flex-1 sm:flex-none"
            >
              {range}
            </Button>
          ))}
          <Button
            variant={selectedTimeRange === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeRange("custom")}
            className="min-w-[80px] flex-1 sm:flex-none"
          >
            Custom
          </Button>
        </div>

        {selectedTimeRange === "custom" && (
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:w-auto">
            <div className="flex items-center gap-2">
              <Label htmlFor="start-time" className="text-sm whitespace-nowrap">
                From:
              </Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="flex-1 sm:w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="end-time" className="text-sm whitespace-nowrap">
                To:
              </Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="flex-1 sm:w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart Container with proper containment */}
      <div className="relative">
        <div className="h-64 w-full relative overflow-hidden min-h-[200px] sm:h-64 border rounded-lg bg-white">
          <Line data={data} options={options} />
        </div>
      </div>

      {/* Annotation Dialog */}
      {showAnnotationDialog !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Add Annotation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tap {tapChangeEvents[showAnnotationDialog]?.direction} at {tapChangeEvents[showAnnotationDialog]?.time}
            </p>
            <Input
              placeholder="Enter annotation..."
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAnnotationDialog(null)
                  setAnnotationText("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => addAnnotation(showAnnotationDialog)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
