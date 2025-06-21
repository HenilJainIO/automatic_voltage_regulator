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
import type { CurrentRating } from "@/types/transformer"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface EnhancedCurrentChartProps {
  currentRating: CurrentRating
  currentValue: number
}

export function EnhancedCurrentChart({ currentRating, currentValue }: EnhancedCurrentChartProps) {
  const [currentData, setCurrentData] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h")
  const [customStartTime, setCustomStartTime] = useState("")
  const [customEndTime, setCustomEndTime] = useState("")

  useEffect(() => {
    generateHistoricalCurrentData()
  }, [selectedTimeRange, customStartTime, customEndTime, currentValue])

  const generateHistoricalCurrentData = () => {
    const now = new Date()
    let startTime: Date
    let dataPoints: number

    if (selectedTimeRange === "custom" && customStartTime && customEndTime) {
      startTime = new Date(customStartTime)
      const endTime = new Date(customEndTime)
      const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      dataPoints = Math.min(Math.max(Math.floor(diffHours * 12), 10), 200)
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
    const newCurrentData = []

    const interval = (now.getTime() - startTime.getTime()) / dataPoints

    for (let i = 0; i <= dataPoints; i++) {
      const time = new Date(startTime.getTime() + i * interval)
      newLabels.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

      // Generate current data with some variation around the current value
      const baseCurrent = currentValue
      const variation = Math.random() * 100 - 50 // ±50A variation
      const generatedCurrent = Math.max(0, baseCurrent + variation)
      newCurrentData.push(generatedCurrent)
    }

    setLabels(newLabels)
    setCurrentData(newCurrentData)
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Current (A)",
        data: currentData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.3,
      },
      {
        label: "Rated Current",
        data: Array(labels.length).fill(currentRating.ratedCurrent),
        borderColor: "rgba(59, 130, 246, 0.7)",
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Overcurrent Limit",
        data: Array(labels.length).fill(currentRating.overCurrentLimit),
        borderColor: "rgba(239, 68, 68, 0.7)",
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
            const current = currentData[dataIndex]
            const status = current > currentRating.ratedCurrent ? "Over Rated" : "Normal"
            return [`Status: ${status}`]
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: Math.max(currentRating.ratedCurrent * 1.2, Math.max(...currentData) + 100),
        title: {
          display: true,
          text: "Current (Amperes)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
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
              <Label htmlFor="current-start-time" className="text-sm whitespace-nowrap">
                From:
              </Label>
              <Input
                id="current-start-time"
                type="datetime-local"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="flex-1 sm:w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="current-end-time" className="text-sm whitespace-nowrap">
                To:
              </Label>
              <Input
                id="current-end-time"
                type="datetime-local"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="flex-1 sm:w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div className="h-64 w-full relative overflow-hidden min-h-[200px] sm:h-64 border rounded-lg bg-white">
          <Line data={data} options={options} />
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800">Current Value</div>
          <div className="text-lg font-bold text-blue-900">{currentValue} A</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-medium text-green-800">Rated Current</div>
          <div className="text-lg font-bold text-green-900">{currentRating.ratedCurrent} A</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="font-medium text-red-800">Overcurrent Limit</div>
          <div className="text-lg font-bold text-red-900">{currentRating.overCurrentLimit} A</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center p-4 rounded-lg border">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Current Status</div>
          <div
            className={`text-lg font-bold ${
              currentValue > currentRating.ratedCurrent
                ? "text-red-600"
                : currentValue > currentRating.overCurrentLimit
                  ? "text-yellow-600"
                  : "text-green-600"
            }`}
          >
            {currentValue > currentRating.ratedCurrent
              ? "OVER RATED CURRENT"
              : currentValue > currentRating.overCurrentLimit
                ? "APPROACHING LIMIT"
                : "NORMAL"}
          </div>
        </div>
      </div>
    </div>
  )
}
