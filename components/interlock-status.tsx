import { AlertTriangle, Check } from "lucide-react"
import type { Interlocks } from "@/types/transformer"

interface InterlockStatusProps {
  interlocks: Interlocks
}

export function InterlockStatus({ interlocks }: InterlockStatusProps) {
  const interlockItems = [
    { key: "tapChangerInProgress", label: "Tap Changer in Progress" },
    { key: "tapChangerStuck", label: "Tap Changer Stuck" },
    { key: "motorFault", label: "Motor Fault" },
    { key: "manualLock", label: "Manual Lock" },
  ] as const

  return (
    <div className="space-y-2">
      {interlockItems.map((item) => (
        <div key={item.key} className="flex items-center justify-between">
          <span className="text-sm">{item.label}</span>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 ${
              interlocks[item.key] ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {interlocks[item.key] ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-medium">Active</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span className="text-xs font-medium">Clear</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
