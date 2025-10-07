'use client'


import {useState} from "react";
import ServiceDashboardHeader from "@/components/dashboard/service/service-dashboard-header";
import ServiceBookings from "@/components/dashboard/service/my-bookings/service-bookings";
import ServiceProfile from "@/components/dashboard/service/profile-info/service-profile";

export default function ServiceDashboard() {

	const [active,setActive] = useState(0)

	return (
			<div className={'py-5'}>
				<ServiceDashboardHeader active={active} setActive={setActive}/>
				{active === 0 && <ServiceBookings />}
				{active === 1 && <ServiceProfile />}
			</div>
	)
}
