'use client'


import UserDashboardHeader from "@/components/dashboard/user/user-dashboard-header";
import UserProfile from "@/components/dashboard/user/profile-info/user-profile";
import {useState} from "react";
import UserBookings from "@/components/dashboard/user/my-bookings/user-bookings";
import UserSparePartRequest from "@/components/dashboard/user/spare-part-request/user-spare-part-request";

export default function UserDashboard() {

	const [active,setActive] = useState(0)

	return (
			<div className={'py-5'}>
				<UserDashboardHeader active={active} setActive={setActive}/>
				{active === 0 && <UserBookings />}
				{active === 1 && <UserSparePartRequest />}
				{active === 2 && <UserProfile />}
			</div>
	)
}
