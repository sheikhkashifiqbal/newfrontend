'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Pen, Pencil, PlusIcon} from "lucide-react";
import {CustomSwitch} from "@/components/app-custom/custom-switch";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";

export default function ServiceServicesTab() {

	const serviceSchema = z.object({
		name: z.string(),
		active: z.boolean(),
		brands: z.array(z.string()).min(1)
	})

	const servicesTabFormSchema = z.object({
		services: z.array(serviceSchema)
	})

	const form = useForm<z.infer<typeof servicesTabFormSchema>>({
		resolver: zodResolver(servicesTabFormSchema),
		defaultValues: {
			services: [
				{
					name: 'Engine',
					active: true,
					brands: ["BMW","Mercedes", "Audi", "Changan", "Zeekr", "Lamborghini"]
				},
				{
					name: 'Battery',
					active: true,
					brands: ["BMW","Mercedes", "Audi", "Changan", "Zeekr", "Lamborghini"]
				},
				{
					name: 'Electronics',
					active: true,
					brands: ["BMW","Mercedes", "Audi", "Changan", "Zeekr", "Lamborghini"]
				},
				{
					name: 'Brake',
					active: true,
					brands: ["BMW","Mercedes", "Audi", "Changan", "Zeekr", "Lamborghini"]
				}
			]
		}
	})

	const {fields,append} = useFieldArray({
		control: form.control,
		name: 'services'
	})

	return (
			<DashboardContainer>
				<Form {...form}>
					<form className={'flex flex-col gap-y-5'}>
						<div className={'flex items-center gap-x-8'}>
							<h5 className={'text-dark-gray text-sm font-medium'}>Services</h5>
							<Button className={'flex items-center justify-center gap-x-2'}>
								<PlusIcon className={'size-5 text-misty-gray'}/>
								<h5 className={'text-sm font-medium text-misty-gray'}>Add new</h5>
							</Button>
						</div>

						<div className={'grid grid-cols-1 600:grid-cols-2 xl:grid-cols-3 gap-6'}>
							{fields.map((field, index) => {
								return (
										<div className={'flex flex-col bg-white gap-y-4 p-6 rounded-2xl'} key={field.id}>
											<div className={'flex items-center justify-between'}>
												<CustomSwitch label={'Engine'} id={field.id} />
												<Pencil className={'cursor-pointer size-5 text-dark-gray'}/>
											</div>
											<div className={'flex flex-wrap gap-2'}>
												{field.brands.map((brand, bindex) => {
													return (
															<div className={'border border-soft-gray rounded-[52px] py-1.5 px-4 max-w-fit'} key={`${field.id}-${brand}`}>
																{brand}
															</div>
													)
												})}
											</div>
										</div>
								)
							})}
						</div>
						<CustomBlueBtn className={'max-w-fit'} text={'Save changes'}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
