"use client"

import { useEffect, useRef, useState } from "react"
import DigitReel from "./digit-reel"

interface CountdownTimerProps {
  initialMinutes?: number
  initialSeconds?: number
}

export default function CountdownTimer({ initialMinutes = 0, initialSeconds = 0 }: CountdownTimerProps) {
  const totalMs = (initialMinutes * 60 + initialSeconds) * 1000
  const [remainingMs, setRemainingMs] = useState(totalMs)
  const [isActive, setIsActive] = useState(totalMs > 0)
  // Deadline-based timing: immune to setInterval drift and background-tab throttling
  const endRef = useRef<number>(Date.now() + totalMs)

  useEffect(() => {
    if (!isActive) return

    const id = setInterval(() => {
      const left = Math.max(0, endRef.current - Date.now())
      setRemainingMs(left)
      if (left === 0) {
        clearInterval(id)
        setIsActive(false)
      }
    }, 250)

    return () => clearInterval(id)
  }, [isActive])

  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // Format numbers to always have two digits
  const formattedMinutes = minutes.toString().padStart(2, "0")
  const formattedSeconds = seconds.toString().padStart(2, "0")

  return (
    <div className="flex items-center justify-center font-twk-everett">
      <div className="flex items-center">
        <div className="-mr-2">
          <DigitReel value={formattedMinutes[0]} />
        </div>
        <div className="-mx-2">
          <DigitReel value={formattedMinutes[1]} />
        </div>
        <div className="text-white text-7xl mx-1 font-twk-everett font-normal">:</div>
        <div className="-mx-2">
          <DigitReel value={formattedSeconds[0]} />
        </div>
        <div className="-ml-2">
          <DigitReel value={formattedSeconds[1]} />
        </div>
      </div>
    </div>
  )
}
