"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle, Database } from "lucide-react"

interface ApiStatusProps {
  usingLocalStorage?: boolean
}

export default function ApiStatus({ usingLocalStorage = false }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkApiStatus = async () => {
    setStatus("checking")
    try {
      const response = await fetch("https://json-api.uz/api/project/fn37/cars", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setStatus("online")
      } else {
        setStatus("offline")
      }
    } catch (error) {
      setStatus("offline")
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Data Source
          <div className="flex gap-2">
            <Badge variant={status === "online" ? "default" : status === "offline" ? "destructive" : "secondary"}>
              {status === "checking" && "Checking API..."}
              {status === "online" && (
                <>
                  <CheckCircle size={14} className="mr-1" />
                  API Online
                </>
              )}
              {status === "offline" && (
                <>
                  <AlertCircle size={14} className="mr-1" />
                  API Offline
                </>
              )}
            </Badge>
            {usingLocalStorage && (
              <Badge variant="outline">
                <Database size={14} className="mr-1" />
                Local Storage
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
            {status === "offline" && (
              <div className="text-amber-600 mt-1">Using local storage as fallback. Data will be saved locally.</div>
            )}
            {status === "online" && !usingLocalStorage && (
              <div className="text-green-600 mt-1">Connected to API. Data is synchronized.</div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkApiStatus} disabled={status === "checking"}>
            <RefreshCw size={14} className={`mr-1 ${status === "checking" ? "animate-spin" : ""}`} />
            Check Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
