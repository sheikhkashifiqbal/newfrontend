"use client"

import * as React from "react"
import { useState } from "react"
import { format, startOfToday } from "date-fns"   // ✅ added startOfToday
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface IDatePicker {
  date?: Date | undefined
  setDate?: (date: Date | undefined) => void
  placeholder?: string
  buttonClassname?: string
  placeholderClassname?: string
  isItalicPlaceholder?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Date selection",
  buttonClassname,
  placeholderClassname,
  isItalicPlaceholder = false,
}: IDatePicker) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full flex items-center justify-between py-3 px-4 rounded-[12px] border bg-white border-soft-gray",
            buttonClassname
          )}
        >
          {date ? (
            format(date, "PPP")
          ) : (
            <h5
              className={cn(
                "text-sm font-medium text-misty-gray",
                placeholderClassname,
                isItalicPlaceholder && "italic"
              )}
            >
              {placeholder}
            </h5>
          )}
          <CalendarIcon className="text-charcoal size-5 font-semibold" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          className="w-full"
          mode="single"
          selected={date}
          // ⛔ Older than today not selectable
          disabled={(d) => d < startOfToday()}
          onSelect={(d) => {
            setDate && setDate(d)
            setOpen(false) // close after pick (kept behavior simple)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
