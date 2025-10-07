'use client'


import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldFile from "@/components/app-custom/custom-form-field-file";
import TrashIcon from "@/assets/icons/register/TrashIcon.svg";
import {Button} from "@/components/ui/button";
import {useFieldArray} from "react-hook-form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import WorkHoursSelector from "@/components/register/selectors/work-hours-selector";
import WorkDaysSelector from "@/components/register/selectors/work-days-selector";

interface IServiceRegistrationStep1 {
	form: any;
	type?: "service" | "store"
}

export default function ServiceRegistrationStep1({
		form,
		type = "service"
																								 }: IServiceRegistrationStep1) {

	const {fields: branchesLive, append, remove} = useFieldArray({
		control: form.control,
		name: 'branches'
	})

	const divGridClassname = 'grid grid-cols-1 gap-6 500:grid-cols-2';

	return (

			<>
				<h5 className={'text-steel-blue text-base font-semibold'}>Company Details</h5>

				<div className={divGridClassname}>
					<CustomFormField
							name={'companyName'}
							isItalicPlaceholder={true}
							placeholder={'Type your company name'}
							label={'Company name *'}
							control={form.control}
					/>

					<CustomFormField
							name={'brandName'}
							isItalicPlaceholder={true}
							placeholder={'Type your brand name'}
							label={'Brand name *'}
							control={form.control}
					/>
				</div>

				<div className={divGridClassname}>
					<CustomFormField
							name={'taxId'}
							isItalicPlaceholder={true}
							placeholder={'Type your TIN number'}
							label={'Tax ID *'}
							control={form.control}
					/>

					<CustomFormField
							name={'managerName'}
							isItalicPlaceholder={true}
							placeholder={'Contact person’s name'}
							label={"Manager's name *"}
							control={form.control}
					/>
				</div>

				<div className={divGridClassname}>
					<CustomFormField
							name={'managerSurname'}
							isItalicPlaceholder={true}
							placeholder={'Contact person’s surname'}
							label={"Manager's surname *"}
							control={form.control}
					/>

					<CustomFormField
							inputType={'tel'}
							name={'managerStationaryPhone'}
							isItalicPlaceholder={true}
							placeholder={"Type your stationary phone"}
							label={"Manager’s stationary phone"}
							control={form.control}
					/>
				</div>


				<div className={divGridClassname}>
					<CustomFormField
							inputType={'tel'}
							name={'managerMobileNumber'}
							isItalicPlaceholder={true}
							placeholder={"Type your mobile phone"}
							label={"Manager’s mobile number *"}
							control={form.control}
					/>

					<CustomFormField
							name={'email'}
							isItalicPlaceholder={true}
							placeholder={"Type your e-mail address *"}
							label={"E-mail address *"}
							control={form.control}
					/>
				</div>

				<div className={divGridClassname}>
					<CustomFormField
							name={'website'}
							isItalicPlaceholder={true}
							placeholder={"Type your website"}
							label={"Website"}
							control={form.control}
					/>
				</div>

				<div className={divGridClassname}>
					<CustomFormField
							name={'password'}
							isItalicPlaceholder={true}
							placeholder={"Type your password"}
							label={"Your password *"}
							control={form.control}
					/>
					<CustomFormField
							name={'repeatPassword'}
							isItalicPlaceholder={true}
							placeholder={"Type your repeat password"}
							label={"Your password repeat*"}
							control={form.control}
					/>
				</div>

				<div className={divGridClassname}>
					<CustomFormFieldFile
					control={form.control}
					label={'Upload your TIN Photo *'}
					name={'tinPhoto'}
			                    // <- ADDED (optional)
					/>
				</div>

				<div className={'flex flex-col pt-8 gap-y-3'}>
					<h5 className={'text-steel-blue text-base font-medium'}>Branch details</h5>
					{branchesLive.map((branch, index) => {
						return (
								<div className={'flex flex-col gap-y-3 mt-4'} key={branch.id}>
									<div className={'flex items-center justify-between'}>
										<h5 className={'text-base text-dark-gray font-medium'}>
											#{index+1} Branch {index === 0 && '*'}
										</h5>
										{index > 0 && (
												<div
														onClick={() => remove(index)} // This removes the car at index
														className={'flex cursor-pointer items-center gap-3'}>
													<img className={'size-[18px]'} src={TrashIcon.src}/>
													<h5 className={'text-bold-red text-base font-medium'}>Delete</h5>
												</div>
										)}
									</div>

									<div className={'grid grid-cols-1 gap-6'}>
										<CustomFormField
												name={`branches.${index}.name`}
												isItalicPlaceholder={true}
												placeholder={"ex., Shamakhi branch"}
												label={"Branch name *"}
												control={form.control}
										/>
									</div>

									<div className={divGridClassname}>
										<CustomFormField
												name={`branches.${index}.code`}
												isItalicPlaceholder={true}
												placeholder={"ex., Shamakhi branch"}
												label={"Branch code *"}
												control={form.control}
										/>
										<CustomFormField
												name={`branches.${index}.managerName`}
												isItalicPlaceholder={true}
												placeholder={"Enter branch manager’s name"}
												label={"Branch manager’s name *"}
												control={form.control}
										/>
									</div>

									<div className={divGridClassname}>
										<CustomFormField
												name={`branches.${index}.managerSurname`}
												isItalicPlaceholder={true}
												placeholder={"Enter branch manager’s name"}
												label={"Branch manager’s surname *"}
												control={form.control}
										/>
										<CustomFormField
												name={`branches.${index}.address`}
												isItalicPlaceholder={true}
												placeholder={"Type your address"}
												label={"Address *"}
												control={form.control}
										/>
									</div>

									<div className={divGridClassname}>
										<CustomFormField
												name={`branches.${index}.location`}
												isItalicPlaceholder={true}
												placeholder={"Select your location"}
												label={"Location *"}
												control={form.control}
										/>
										{/*<CustomFormField*/}
										{/*		name={`branches.${index}.workDays`}*/}
										{/*		isItalicPlaceholder={true}*/}
										{/*		placeholder={"Select the workdays"}*/}
										{/*		label={"Workdays *"}*/}
										{/*		control={form.control}*/}
										{/*/>*/}
										<CustomFormFieldSelector
												name={`branches.${index}.workDays`}
												isItalicPlaceholder={true}
												placeholder={"Select the workdays"}
												label={"Workdays *"}
												control={form.control}
												Children={(onChange, hasError, value) => <WorkDaysSelector form={form} value={value} onChange={onChange}/>}
										/>
									</div>

									<div className={divGridClassname}>
										{/*<CustomFormField*/}
										{/*		name={`branches.${index}.workHours`}*/}
										{/*		isItalicPlaceholder={true}*/}
										{/*		placeholder={"Select your working hours"}*/}
										{/*		label={"Working hours *"}*/}
										{/*		control={form.control}*/}
										{/*/>*/}
										<CustomFormFieldSelector
												name={`branches.${index}.workHours`}
												isItalicPlaceholder={true}
												placeholder={"Select your working hours"}
												label={"Working hours*"}
												control={form.control}
												Children={(onChange, hasError, value) => <WorkHoursSelector form={form} value={value} onChange={onChange}/>}
										/>
										<CustomFormField
												name={`branches.${index}.email`}
												isItalicPlaceholder={true}
												placeholder={"Your email address"}
												label={"Login e-mail for branch *"}
												control={form.control}
										/>
									</div>

									<div className={divGridClassname}>
										<CustomFormField
												name={`branches.${index}.password`}
												isItalicPlaceholder={true}
												placeholder={"Type your password"}
												label={"Login password for branch *"}
												control={form.control}
										/>
										<CustomFormField
												name={`branches.${index}.repeatPassword`}
												isItalicPlaceholder={true}
												placeholder={"Retype your password"}
												label={"Repeat login password for branch *"}
												control={form.control}
										/>
									</div>

									<div className={divGridClassname}>
										<CustomFormFieldFile
										control={form.control}
										label={'Upload branch logo *'}
										name={`branches.${index}.logo`}
										                     // <- ADDED (optional)
										/>
										<CustomFormFieldFile
										control={form.control}
										label={'Upload branch cover *'}
										name={`branches.${index}.cover`}
										                     // <- ADDED (optional)
										/>
									</div>

								</div>
						)
					})}

					<Button
							type={"button"}
							onClick={() => {
								// @ts-ignore
								append({
									info: type === "service" ? [{boxQuantity: 1}] : [{}],
									workHours: [undefined, undefined],
									workDays: []
								})
							}}
							className={'mt-8 max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
						+ Add new branch
					</Button>
				</div>
			</>
	)
}
