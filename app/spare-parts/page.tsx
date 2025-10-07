'use client'
import SparePartsSearchSelectors from "@/components/spare-parts/spare-parts-search-selectors";
import Container from "@/components/Container";
import StoresCards from "@/components/spare-parts/stores-cards";
import SparePartsSearchResults from "@/components/spare-parts/spare-parts-search-results";
import {useState} from "react";

export default function SparePartsPage() {
	const [showResults, setShowResults] = useState(false);

	function handleSearch() {
		setShowResults(true);
	}

	return (
			<div className={'min-h-screen bg-light-gray'}>
				<SparePartsSearchSelectors onSearchClick={handleSearch}/>
				<section className={'w-full bg-light-gray py-10'}>
					<Container>
						{!showResults && <StoresCards />}
						{showResults && <SparePartsSearchResults />}
					</Container>
				</section>
			</div>
	)
}
