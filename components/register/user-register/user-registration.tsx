'use client'
import { useEffect, useState, memo } from "react";
import { z } from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startOfToday } from "date-fns";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldDatePicker from "@/components/app-custom/custom-form-field-date-picker";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import { GenderSelector } from "@/components/register/selectors/gender-selector";
import { grayTriggerClassname } from "@/components/shadcn-extended/SelectExt";
import { Button } from "@/components/ui/button";
import TrashIcon from "@/assets/icons/register/TrashIcon.svg"
import { cn } from "@/lib/utils";
import ArrowLeft from "@/assets/icons/register/arrow-narrow-left.svg";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { CarSelector } from "@/components/services/selectors/CarSelector";
import { CarModelSelector } from "@/components/services/selectors/CarModelSelector";


interface IUserRegistration {
  closeFormAndGoBack: () => void
  openPopup: () => void
}

function UserRegistration({ closeFormAndGoBack, openPopup }: IUserRegistration) {

  const carSchema = z.object({
    carBrand: z.string({ required_error: 'car brand is required' }),
    carModel: z.string({ required_error: 'car model is required' }),
    vinNumber: z.string({ required_error: 'vin number is required' }).min(5, 'vin number must be at least 5 characters'),
    plateNumber: z.string({ required_error: 'plate number is required' }).min(5, 'plate number must be at least 5 characters')
  })

  const userRegistrationFormSchema = z.object({
    name: z.string({ required_error: 'name is required' }).min(3, "name must be at least 3 characters"),
    surname: z.string({ required_error: 'surname is required' }).min(3, "surname must be at least 3 characters"),
    mobileNumber: z.string({ required_error: 'mobile number is required' }).min(5, "mobile number must be at least 3 characters"),
    birthday: z.date({ required_error: 'birthday is required' }),
    gender: z.string({ required_error: 'gender is required' }),
    email: z.string({ required_error: 'email is required' }).email('provide a valid email address'),
    password: z.string({ required_error: 'password is required' }).min(8, 'password must be at least 8 characters'),
    repeatPassword: z.string({ required_error: 'repeat password is required' }),
    cars: z.array(carSchema).min(1)
  })
    .refine((data) => data.password === data.repeatPassword, {
      message: 'Passwords do not match',
      path: ['repeatPassword'],
    });

  const form = useForm<z.infer<typeof userRegistrationFormSchema>>({
    resolver: zodResolver(userRegistrationFormSchema),
    defaultValues: {
      name: undefined,
      surname: undefined,
      birthday: undefined,
      gender: undefined,
      email: undefined,
      password: undefined,
      repeatPassword: undefined,
      cars: [
        {
          carBrand: undefined,
          carModel: undefined,
          vinNumber: undefined,
          plateNumber: undefined
        }
      ]
    },
    mode: "onChange"
  })

  const { fields: carsLive, append, remove } = useFieldArray({
    control: form.control,
    name: "cars"
  })

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  //const { toast } = useToast(); // ⬅️ toast hook

  const [carBrands, setCarBrands] = useState<{ brandId: number; brandName: string }[]>([]);
  const [carModelsMap, setCarModelsMap] = useState<Record<number, { id: number; modelName: string }[]>>({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/brands`);
        const data = await res.json();
        setCarBrands(data);
      } catch (err) {
        console.error("Failed to load car brands:", err);
      }
    };
    fetchBrands();
  }, []);

  const selectedCars = useWatch({ control: form.control, name: "cars" });

  useEffect(() => {
    selectedCars.forEach(async (car) => {
      const brandId = parseInt(car?.carBrand);
      if (brandId && !carModelsMap[brandId]) {
        try {
          const res = await fetch(`${BASE_URL}/api/brand-models/by-brand/${brandId}`);
          const data = await res.json();
          setCarModelsMap((prev) => ({ ...prev, [brandId]: data }));
        } catch (err) {
          console.error(`Failed to load models for brand ${brandId}`, err);
        }
      }
    });
  }, [selectedCars]);

  // ===== Duplicate email helpers =====
  async function isDuplicateEmail(email: string): Promise<boolean> {
    if (!email) return false;
    const url = `${BASE_URL}/api/users/check/email?email=${encodeURIComponent(email)}`;
    try {
      const res = await fetch(url, { method: "GET" });
      // Some backends use 409/422 to signal duplicates
      if (!res.ok) {
        return res.status === 409 || res.status === 422;
      }
      const json: any = await res.json().catch(() => ({}));
      if (typeof json === "boolean") {
        // if backend returns true=unique / false=duplicate
        return json === false;
      }
      if ("isUnique" in json) return json.isUnique === false;
      if ("duplicate" in json) return !!json.duplicate;
      if (typeof json.message === "string") return /duplicate/i.test(json.message);
      return false;
    } catch {
      // don't block on network noise
      return false;
    }
  }

  // Live validator for email field (runs on blur via CustomFormField.asyncValidate)
  const validateEmailLive = async (val: string) => {
    if (!val) return null;
    const dup = await isDuplicateEmail(val);
    return dup ? "Duplicate email" : null;
  };

  // On Submit
  async function onSubmit(values: z.infer<typeof userRegistrationFormSchema>) {
    try {
      // ---- PRE-SUBMIT DUPLICATE CHECK (BLOCK ALL POSTS IF DUPLICATE) ----
      const dup = await isDuplicateEmail(values.email);
      if (dup) {
        form.setError("email", { type: "server", message: "Duplicate email" });
        return; // ⛔ stop: DO NOT create user, DO NOT create cars
      }

      // 1) Create user
      const userResponse = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${values.name} ${values.surname}`,
          birthday: values.birthday.toISOString().split("T")[0],
          gender: values.gender,
          email: values.email,
          password: values.password,
        }),
      });
      if (!userResponse.ok) {
        throw new Error("User registration failed");
      }
      const userData = await userResponse.json();
      const userId = userData.id || userData.userId;

      // 2) Create cars
      for (const car of values.cars) {
        const carResponse = await fetch(`${BASE_URL}/api/cars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            brandId: car.carBrand,
            carModel: car.carModel,
            vinNumber: car.vinNumber,
            plateNumber: car.plateNumber,
          }),
        });
        if (!carResponse.ok) {
          console.error(`Failed to register car: ${car.carBrand} ${car.carModel}`);
        }
      }

      // ✅ Success toast
		setSuccessMsg("User is registered successfully.");
		setTimeout(() => setSuccessMsg(null), 3000);
      // You can also call openPopup() or closeFormAndGoBack() here if needed
      // openPopup?.();
    } catch (error) {
      console.error("Registration error:", error);
      // Optional: show a toast here too if you want
      // toast({ title: "Registration failed", description: "Please try again." });
    }
  }

  const divGridClassname = 'grid grid-cols-1 gap-6 500:grid-cols-2';

  return (
    <div className={'pt-10 pb-20 mx-auto w-[806px] h-full flex flex-col gap-y-6'}>

      {/*Navbar*/}
      <div className={'flex flex-col gap-y-8'}>
        <h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>Registration</h1>
        <div className={'h-2 w-full rounded-[200px] bg-steel-blue'}></div>
        <div className={'flex flex-col'}>
          <h5 className={'text-charcoal text-base'}>Step 1 of 1</h5>
          <h4 className={'text-charcoal text-xl font-medium'}>Enter your profile details</h4>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-5'}>
          <div className={divGridClassname}>
            <CustomFormField
              name={'name'}
              label={'First name *'}
              placeholder={'Type your name'}
              control={form.control}
              isItalicPlaceholder={true}
            />
            <CustomFormField
              name={'surname'}
              label={'Last name *'}
              placeholder={'Type your surname'}
              control={form.control}
              isItalicPlaceholder={true}
            />
          </div>

          <div className={divGridClassname}>
            <CustomFormField
              name={'mobileNumber'}
              label={'Mobile number *'}
              placeholder={'Type your mobile number'}
              control={form.control}
              isItalicPlaceholder={true}
            />

            <CustomFormFieldDatePicker
              isItalicPlaceholder={true}
              name={'birthday'}
              control={form.control}
              placeholder={'Enter your birthday'}
              label={'Birthday *'}
              maxDate={startOfToday()}
            />
          </div>

          <div className={divGridClassname}>
            <CustomFormFieldSelector
              name={'gender'}
              label={'Gender *'}
              control={form.control}
              Children={(onChange, hasError, value) =>
                <GenderSelector
                  triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
                  placeholder={'Select gender'}
                  value={value}
                  onChange={onChange}
                />}
            />

            <CustomFormField
              name={'email'}
              control={form.control}
              isItalicPlaceholder={true}
              placeholder={'Type your e-mail address'}
              label={'E-mail address *'}
              inputType={"email"}
              // ⬇️ Live duplicate check on blur (shows message under field)
              asyncValidate={validateEmailLive}
            />
          </div>

          <div className={divGridClassname}>
            <CustomFormField
              name={'password'}
              control={form.control}
              isItalicPlaceholder={true}
              placeholder={'Type your password'}
              label={'Password *'}
              inputType={'password'}
            />

            <CustomFormField
              name={'repeatPassword'}
              control={form.control}
              isItalicPlaceholder={true}
              placeholder={'Retype your password'}
              label={'Repeat Password *'}
              inputType={'password'}
            />
          </div>

          <div className={'flex flex-col pt-8 gap-y-3'}>
            <h5 className={'text-steel-blue text-base font-medium'}>Car details</h5>
            {carsLive.map((car, index) => {
              return (
                <div className={'flex flex-col gap-y-3 mt-4'} key={car.id}>
                  <div className={'flex items-center justify-between'}>
                    <h5 className={'text-base text-dark-gray font-medium'}>
                      #{index + 1} Car {index === 0 && '*'}
                    </h5>
                    {index > 0 && (
                      <div
                        onClick={() => remove(index)}
                        className={'flex cursor-pointer items-center gap-3'}>
                        <div className={'flex items-center justify-center'}>
                          <TrashIcon width="35px" height="38px" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={divGridClassname}>
                    <CustomFormFieldSelector
                      label={'Car brand'}
                      control={form.control}
                      name={`cars.${index}.carBrand`}
                      Children={(onChange, hasError, value) => (
                        <CarSelector
                          triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
                          value={value}
                          placeholder={'Select car brand'}
                          onChange={onChange}
                          options={carBrands.map(b => ({ label: b.brandName, value: String(b.brandId) }))}
                        />
                      )}
                    />

                    <CustomFormFieldSelector
                      label={'Car model'}
                      control={form.control}
                      name={`cars.${index}.carModel`}
                      Children={(onChange, hasError, value) => {
                        const brandId = parseInt(form.getValues(`cars.${index}.carBrand`));
                        const models = carModelsMap[brandId] || [];
                        return (
                          <CarModelSelector
                            triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
                            value={value}
                            placeholder={'Select car model'}
                            onChange={onChange}
                            options={models.map(m => ({ label: m.modelName, value: m.modelName }))}
                          />
                        );
                      }}
                    />
                  </div>

                  <div className={cn(divGridClassname, 'pt-4')}>
                    <CustomFormField
                      name={`cars.${index}.vinNumber`}
                      placeholder={"Car's VIN Number"}
                      control={form.control}
                      label={'VIN number'}
                      isItalicPlaceholder={true}
                    />

                    <CustomFormField
                      name={`cars.${index}.plateNumber`}
                      placeholder={"Ex: 10-AA-100"}
                      control={form.control}
                      label={'Plate number'}
                      isItalicPlaceholder={true}
                    />
                  </div>
                </div>
              )
            })}
            <Button
              type={"button"}
              onClick={() => append({ carBrand: "", carModel: "", vinNumber: "", plateNumber: "" })}
              className={'mt-8 max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
              + Add new car
            </Button>
          </div>
        </form>
      </Form>

      <div className={'pt-12 flex justify-between items-center'}>
        <Button onClick={closeFormAndGoBack} className={'py-3 px-6 items-center justify-center gap-x-4'}>
          <ArrowLeft className={'!size-6'} />
          Back
        </Button>
        <CustomBlueBtn
          onClick={form.handleSubmit(onSubmit)}
          className={'rounded-[12px] justify-center flex items-center gap-x-4 py-3 px-6'}
          show={"children"}>
          Register
        </CustomBlueBtn>
      </div>
	  	
		{successMsg && (
		<div
			role="status"
			aria-live="polite"
			className="fixed right-4 bottom-4 z-[9999] rounded-lg bg-emerald-600 text-white px-4 py-3 shadow-lg"
		>
			{successMsg}
		</div>
		)}
    </div>



  )
}

export default memo(UserRegistration)
