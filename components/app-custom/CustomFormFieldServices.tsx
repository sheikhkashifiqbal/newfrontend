// ⬇️ ONLY the changes shown; keep the rest of your file as-is
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
  /** If provided, runs on blur. Return a string to show as an error; return null/undefined to clear. */
  asyncValidate?: (value: any) => Promise<string | null | undefined>
}

// ...imports and component signature unchanged above...

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
  asyncValidate
}: ICustomFormField) {
  const { setError, clearErrors } = useFormContext();

  // small helper so we can reuse it for blur + enter
  const runAsyncValidation = async (value: any) => {
    if (!asyncValidate) return;
    try {
      const msg = await asyncValidate(value);
      if (msg) setError(name as any, { type: "server", message: msg });
      else clearErrors(name as any);
    } catch {
      // network/other failures: don't block user
      clearErrors(name as any);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
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
            {/* ⬇️ wrapper catches blur + Enter without touching CustomInput’s props */}
            <div
              onBlur={(e) => {
                // mark as touched for RHF
                field.onBlur();
                // async duplicate check
                runAsyncValidation(field.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // run the same validation when user presses Enter
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
                value={field.value ?? ""}
                onChange={(value: string) => field.onChange(inputType === "number" ? Number(value) : value)}
                /* ⛔ do NOT pass onBlur here, CustomInput doesn't accept it */
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

export default CustomFormField;
