import type React from "react"
import { CheckCircle, XCircle } from "lucide-react"

interface InterlockStatusProps {
  interlocks: {
    tapChangerInProgress: boolean
    tapChangerStuck: boolean
    motorFault: boolean
    manualLock: boolean
    tcInRemote: boolean
    tcControlSupplyFail: boolean
    overCurrent: boolean
  }
}

const InterlockStatus: React.FC<InterlockStatusProps> = ({ interlocks }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Tap Changer In Progress</span>
        <div className="flex items-center gap-2">
          {interlocks.tapChangerInProgress ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.tapChangerInProgress ? "text-red-600" : "text-green-600"}`}>
            {interlocks.tapChangerInProgress ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">Tap Changer Stuck</span>
        <div className="flex items-center gap-2">
          {interlocks.tapChangerStuck ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.tapChangerStuck ? "text-red-600" : "text-green-600"}`}>
            {interlocks.tapChangerStuck ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">Motor Fault</span>
        <div className="flex items-center gap-2">
          {interlocks.motorFault ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.motorFault ? "text-red-600" : "text-green-600"}`}>
            {interlocks.motorFault ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">Manual Lock</span>
        <div className="flex items-center gap-2">
          {interlocks.manualLock ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.manualLock ? "text-red-600" : "text-green-600"}`}>
            {interlocks.manualLock ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">TC In Remote</span>
        <div className="flex items-center gap-2">
          {interlocks.tcInRemote ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${interlocks.tcInRemote ? "text-green-600" : "text-red-600"}`}>
            {interlocks.tcInRemote ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">TC Control Supply</span>
        <div className="flex items-center gap-2">
          {interlocks.tcControlSupplyFail ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.tcControlSupplyFail ? "text-red-600" : "text-green-600"}`}>
            {interlocks.tcControlSupplyFail ? "Failed" : "OK"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">Over Current</span>
        <div className="flex items-center gap-2">
          {interlocks.overCurrent ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${interlocks.overCurrent ? "text-red-600" : "text-green-600"}`}>
            {interlocks.overCurrent ? "Active" : "Normal"}
          </span>
        </div>
      </div>
    </div>
  )
}

// keep a default for convenience **and** provide a named export
export default InterlockStatus
export { InterlockStatus }
