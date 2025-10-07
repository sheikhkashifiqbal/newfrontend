'use client'
import {IWorkHoursPopup, IWorkHoursSelector} from "@/components/register/selectors/work-hours-selector";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import CustomCheckbox from "@/components/app-custom/custom-checkbox";
import { v4 as uuidv4 } from 'uuid';

function WorkDaysPopup({
  isOpen,
  closePopup,
  value,
  onChange,
  form
}: IWorkHoursPopup) {
  const [vState, setVState] = useState(value);

  const choices = [
    { value: "monday",    label: "Monday" },
    { value: "tuesday",   label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday",  label: "Thursday" },
    { value: "friday",    label: "Friday" },
    { value: "saturday",  label: "Saturday" },
    { value: "sunday",    label: "Sunday" }
  ];

  return (
    <Dialog open={isOpen}>
      <DialogContent className={"overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8"}>
        <DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
          <DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
            Select the workdays
          </DialogTitle>
          <DialogPrimitive.Close onClick={() => {
            setVState(value)
            closePopup()
          }}>
            <X className={'size-6 text-charcoal/50'}/>
          </DialogPrimitive.Close>
        </DialogHeader>

        <div className="w-full px-8 flex flex-col gap-8">
          <div className={'flex flex-wrap gap-8 items-center'}>
            {choices.map((choice) => (
              <CustomCheckbox
                key={choice.value}
                id={uuidv4()}
                label={choice.label}
                value={choice.value}
                checked={vState?.includes(choice.value)}
                onChange={(state, val) => {
                  if (state) {
                    const arr = Array.from(new Set([...(vState || []), val]))
                    setVState(arr as string[])
                  } else {
                    const arr = (vState || []).filter((vs) => vs !== val)
                    setVState(arr as string[])
                  }
                }}
              />
            ))}
          </div>

          <CustomBlueBtn
            onClick={() => {
              if (onChange && vState) onChange(vState as string[])
              else setVState(value)
              closePopup()
            }}
            text={"Save"}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function WorkDaysSelector({ onChange, value, form }: IWorkHoursSelector) {
  const [popupOpen, setPopupOpen] = useState(false)

  return (
    <div className={'flex justify-between items-center !min-h-14 rounded-[12px] py-3 px-4 bg-white border border-soft-gray'}>
      {value && value.length > 0 ? (
        <span className={'text-sm font-medium text-charcoal'}>
          {value.length} days selected
        </span>
      ) : (
        <span className={'text-sm italic font-medium text-misty-gray'}>
          Select the workdays
        </span>
      )}

      <Button
        onClick={() => setPopupOpen(true)}
        type={"button"}
        className={'max-h-8 bg-steel-blue/10 rounded-[6px] py-3 px-4 flex items-center justify-center text-charcoal text-sm font-medium'}>
        Select
      </Button>

      <WorkDaysPopup form={form} onChange={onChange} value={value} isOpen={popupOpen} closePopup={() => setPopupOpen(false)} />
    </div>
  )
}
