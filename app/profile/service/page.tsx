'use client'

import ProfileCover from "@/components/profile/profile-cover";
import ProfileTabs from "@/components/profile/profile-tabs";
import {useState} from "react";
import ProfileOffersCards from "@/components/profile/profile-offers-cards";
import ProfileReviews from "@/components/profile/profile-reviews";

export default function ServiceProfilePage() {

	const [activeTab, setActiveTab] = useState(0);

	return (
			<div className={'bg-light-gray flex flex-col gap-y-5 py-10'}>
				<ProfileCover />
				<ProfileTabs
						type={'service'}
						activeTab={activeTab}
						onChange={(tab) => setActiveTab(tab)}
				/>
				{activeTab === 0 && <ProfileOffersCards type={'service'} />}
				{activeTab === 1 && <ProfileReviews />}
			</div>
	)
}
