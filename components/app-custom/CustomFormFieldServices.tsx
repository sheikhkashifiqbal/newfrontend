// ⬇️ Updated CustomFormField.tsx
"use client"
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import CustomInput from "@/components/app-custom/custom-input";
import {cn} from "@/lib/utils";
import { useFormContext } from "react-hook-form";

export interface ICustomFormField {
  control: any
  name: string
  label?: string
  rightMostLabel?: ReactNode
  placeholder?: string
  description?: string
  labelClassname?: string
  inputType?: HTMLInputTypeAttribute
  isItalicPlaceholder?: boolean
  className?: string
  containerClassname?: string
  registerOptions?: any;        // 👈 needed for schema validation
  asyncValidate?: (value: any) => Promise<string | null | undefined>
}

function CustomFormField({
  control,
  name,
  label = "label",
  rightMostLabel,
  placeholder = "placeholder",
  description,
  labelClassname,
  inputType,
  isItalicPlaceholder = false,
  className,
  containerClassname,
  registerOptions,
  asyncValidate
}: ICustomFormField) {

  const { setError, clearErrors, register } = useFormContext();

  const runAsyncValidation = async (value: any) => {
    if (!asyncValidate) return;
    try {
      const msg = await asyncValidate(value);
      if (msg) setError(name as any, { type: "server", message: msg });
      else clearErrors(name as any);
    } catch {
      clearErrors(name as any);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={registerOptions}     // 👈 now RHF receives validation rules
      render={({ field, fieldState }) => (
        <FormItem className={cn(containerClassname)}>
          {rightMostLabel ? (
            <div className="flex items-center justify-between">
              <FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
              {rightMostLabel}
            </div>
          ) : (
            <FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
          )}

          <FormControl>
            <div
              onBlur={() => {
                field.onBlur();
                runAsyncValidation(field.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runAsyncValidation(field.value);
                }
              }}
            >
              <CustomInput
                className={cn('h-14', className, fieldState.error && '!border-vibrant-red')}
                isItalicPlaceholder={isItalicPlaceholder}
                inputType={inputType}
                placeholder={placeholder}
                {...field}
                
                // 👉 ensure Zod receives correct type
                value={field.value ?? ""}
                onChange={(value: string) =>
                  field.onChange(inputType === "number" ? Number(value) : value)
                }
              />
            </div>
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="text-vibrant-red text-xs" />
        </FormItem>
      )}
    />
  );
}

export default memo(CustomFormField);
