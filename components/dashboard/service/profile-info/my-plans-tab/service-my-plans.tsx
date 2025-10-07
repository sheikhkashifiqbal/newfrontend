'use client'

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import {
	IServiceMyPlansTableColumns, ServiceMyPlansTableColumns
} from "@/components/dashboard/service/profile-info/my-plans-tab/service-my-plans-table-columns";

export default function ServiceMyPlans() {

	const data: IServiceMyPlansTableColumns[] = [
		{
			id: 1,
			branch: 'Baku',
			subscriptionType: 'Central',
			date: '12.12.24',
			auto: true
		},
		{
			id: 1,
			branch: 'Quba',
			subscriptionType: 'Regional',
			date: '12.12.25',
			auto: false
		},
	]

	const invoices = [
		{
			id: 0,
			date: '14.04.2024',
			total: '$200.00',
			status: 'Paid'
		},
		{
			id: 1,
			date: '14.03.2024',
			total: '$200.00',
			status: 'Paid'
		},
	]

	const invoiceHeaders = ["Date", "Invoice Total", "Status"]

	return (
			<DashboardContainer>
				<div className={'flex flex-col gap-y-5'}>
					<h5 className={'text-dark-gray text-sm font-medium'}>Plans</h5>

					<CustomDataTable columns={ServiceMyPlansTableColumns()} data={data} />


					<h5 className={'mt-12 text-dark-gray text-sm font-medium'}>Invoices</h5>

					<div className={'flex flex-col'}>
						{/*	Headers*/}
						<div className={'grid grid-cols-3 gap-x-6'}>
							{invoiceHeaders.map((header, index) => {
								return (
										<h5 className={'text-charcoal font-semibold text-base'} key={index}>{header}</h5>
								)
							})}
						</div>

						{/*	Rows*/}
						{invoices.map((invoice) => {
							return (
									<div className={'grid grid-cols-3 gap-x-6 border-b border-b-charcoal/10 py-4'} key={invoice.id}>
										<h5 className={'text-charcoal text-base'}>{invoice.date}</h5>
										<h5 className={'text-charcoal text-base'}>{invoice.total}</h5>
										<h5 className={'text-charcoal text-base'}>{invoice.status}</h5>
									</div>
							)
						})}
					</div>
				</div>
			</DashboardContainer>
	)
}
