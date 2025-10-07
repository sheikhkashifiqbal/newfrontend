'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {MoreVertical, Plus} from "lucide-react";
import Link from "next/link";
import {fileSchema} from "@/lib/utils";
import ServiceAddNewBranchPopup
	from "@/components/dashboard/service/profile-info/my-branches-tab/service-add-new-branch-popup";
import {useState} from "react";




export const serviceBranchFormSchema = z.object({
	name: z.string({required_error: 'branch name is required'}).min(3, "branch name must be at least 3 characters"),
	code: z.string({required_error: 'branch code is required'}).min(3, "branch code must be at least 3 characters"),
	managerName: z.string({required_error: 'manager name is required'}).min(3, "manager name must be at least 3 characters"),
	address: z.string({required_error: 'address is required'}).min(3, "address must be at least 3 characters"),
	location: z.string({required_error: 'location is required'}).min(3, "location must be at least 3 characters"),
	workDays: z.array(z.string({required_error: "Select work days"}), {required_error: "Select work days"}).min(1, {message: "Select at least 1 work day"}).max(7),
	workHours: z.array(z.string({required_error: "Select work hours"}), {required_error: "Select work hours"}).length(2, {message: "Select work hours"}),
	email: z.string({required_error: 'email is required'}).email('provide a valid email address'),
	password: z.string({required_error: 'password is required'}).min(8, 'password must be at least 8 characters'),
	logo: fileSchema,
	cover: fileSchema,
}).refine((data) => data.workHours[0] < data.workHours[1], {
	message: "Start time must be before end time",
	path: ['workHours'],
})

export function ServiceMyBranchesTab() {


	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const serviceBranchesFormSchema = z.object({
		branches: z.array(serviceBranchFormSchema)
	})

	const form = useForm<z.infer<typeof serviceBranchesFormSchema>>({
		resolver: zodResolver(serviceBranchesFormSchema),
		mode: 'onChange',
		defaultValues: {
			branches: Array.from({length: 6}).map((_,index) => {
				return {
					name: 'Shamakhi Branch',
					code: '123-9841024',
					managerName: 'Kamran Rustamli',
					address: 'Bakı ş., Heydər Əliyev pr., 191',
					location: 'location',
				}
			})
		}
	})

	const {fields, append} = useFieldArray({
		control: form.control,
		name: 'branches'
	})

	return (
			<DashboardContainer className={'pb-10'}>
				<Form {...form}>
					<form className={'flex flex-col gap-y-5'}>
						<div className={'flex items-center gap-x-8'}>
							<h5 className={'text-dark-gray text-sm font-medium'}>Branches</h5>
							<Button onClick={() => setIsPopupOpen(true)} type={"button"} className={'flex items-center justify-center gap-x-2'}>
								<Plus className={'size-5 text-misty-gray'}/>
								<h5 className={'text-sm font-medium text-misty-gray'}>Add new</h5>
							</Button>
						</div>

						<div className={'grid grid-cols-1 570:grid-cols-2 xl:grid-cols-3 gap-6'}>
							{fields.map((field, index) => {
								return (
										<div className={'bg-white flex flex-col gap-y-4 p-6 rounded-2xl'} key={field.id}>
											<div className={'flex items-center justify-between'}>
												{/*Name and code*/}
												<div className={'flex flex-col gap-y-1'}>
													<h4 className={'text-xl font-medium text-steel-blue'}>{field.name}</h4>
													<h6 className={'text-xs font-medium text-misty-gray'}>{field.code}</h6>
												</div>
												{/*	Dots*/}
												<MoreVertical className={'cursor-pointer size-5 text-black'}/>
											</div>

											<div className={'flex flex-col gap-y-1'}>
												<h5 className={'text-misty-gray text-xs font-medium'}>Branch manager</h5>
												<h5 className={'text-dark-gray text-sm font-medium'}>{field.managerName}</h5>
											</div>

											<div className={'flex flex-col gap-y01'}>
												<h6 className={'text-misty-gray text-xs font-medium'}>Address</h6>
												<div className={'flex flex-col'}>
													<h5 className={'text-charcoal font-medium text-sm'}>{field.address}</h5>
													<Link className={'text-[#00A6FB] underline font-medium text-sm'} href={'#'}>
														Google Map
													</Link>
												</div>
											</div>
										</div>
								)
							})}
						</div>
					</form>
				</Form>
				<ServiceAddNewBranchPopup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)} />
			</DashboardContainer>
	)
}
