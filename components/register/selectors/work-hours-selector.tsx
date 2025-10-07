'use client'

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {useEffect, useState} from "react";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {HourSelector} from "@/components/register/selectors/hour-selector";

export interface IWorkHoursSelector {
  onChange?: (value: (string | undefined)[]) => void
  value?: (string | undefined)[]
  form: any
}

export interface IWorkHoursPopup {
  isOpen: boolean
  closePopup: () => void
  onChange?: (value: (string | undefined)[]) => void
  value?: (string | undefined)[]
  form: any
}

function WorkHoursPopup({
  isOpen,
  closePopup,
  value,
  onChange,
  form
}: IWorkHoursPopup) {
  const [vState, setVState] = useState(value);
  console.log("Work Hours:::", vState);

  return (
    <Dialog open={isOpen}>
      <DialogContent className={"overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8"}>
        <DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
          <DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
            Select the work hours
          </DialogTitle>
          <DialogPrimitive.Close onClick={() => {
            setVState(value)
            closePopup()
          }}>
            <X className={'size-6 text-charcoal/50'}/>
          </DialogPrimitive.Close>
        </DialogHeader>

        <div className="w-full px-8 flex flex-col gap-8">
          <div className={'grid grid-cols-2 gap-8 items-center'}>
            {/* From */}
            <HourSelector
              placeholder={"From"}
              value={vState && vState[0]}
              onChange={(selectedValue) => {
                const newValues = [selectedValue, vState ? vState[1] : undefined];
                setVState(newValues)
              }}
            />
            {/* To */}
            <HourSelector
              value={vState && vState[1]}
              onChange={(selectedValue) => {
                const newValues = [vState ? vState[0] : undefined, selectedValue];
                setVState(newValues)
              }}
              placeholder={"To"}
            />
          </div>

          <CustomBlueBtn
            onClick={() => {
              if (onChange && vState && vState[0] && vState[1]) {
                onChange(vState)
              } else {
                setVState(value)
              }
              closePopup()
            }}
            text={"Save"}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function WorkHoursSelector({ onChange, value, form }: IWorkHoursSelector) {
  const [popupOpen, setPopupOpen] = useState(false)
  return (
    <div className={'flex justify-between items-center !min-h-14 rounded-[12px] py-3 px-4 bg-white border border-soft-gray'}>
      {value && value[0] && value[1] ? (
        <span className={'text-sm font-medium text-charcoal'}>
          from {value[0]} to {value[1]}
        </span>
      ) : (
        <span className={'text-sm italic font-medium text-misty-gray'}>
          Select your working hours
        </span>
      )}

      <Button
        onClick={() => setPopupOpen(true)}
        type={"button"}
        className={'max-h-8 bg-steel-blue/10 rounded-[6px] py-3 px-4 flex items-center justify-center text-charcoal text-sm font-medium'}>
        Select
      </Button>

      <WorkHoursPopup form={form} onChange={onChange} value={value} isOpen={popupOpen} closePopup={() => setPopupOpen(false)} />
    </div>
  )
}
