'use client'
import { memo, useEffect, useMemo, useState } from "react";
import * as React from "react";
import { ShopDistanceSelector } from "@/components/spare-parts/spare-parts-search-results/shop-distance-selector";
import ServiceLogo from '@/assets/icons/services/ServiceLogo.svg'
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ---------- Types from response ----------
type SparePartResult = {
  branch_id: number;
  branch_name: string;
  logo_img: string;          // image file name
  state: string[];           // ["new","used"] | ["new"] | ["used"]
  spareparts_type: string;   // e.g., "Brakes"
  latitude: number;
  longitude: number;
  stars: number;             // rating number
};

// ---------- Haversine distance (km) ----------
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatState(stateArr: string[]) {
  if (!Array.isArray(stateArr) || stateArr.length === 0) return 'All';
  const s = new Set(stateArr.map(s => s?.toLowerCase()));
  if (s.has('new') && s.has('used')) return 'All';
  if (s.has('new')) return 'new';
  if (s.has('used')) return 'used';
  return 'All';
}

type SortOrder = 'all' | 'closest' | 'farthest';

// ---------- Card ----------
function ResultCard({
  item,
  userLat,
  userLon,
  onRequest,
  selectedCity,             // ✅ inject selected city to the card
}: {
  item: SparePartResult & { distanceKm?: number };
  userLat: number;
  userLon: number;
  onRequest: (branchId: number) => void;
  selectedCity: string | undefined;
}) {
  const distanceKm = useMemo(() => {
    if (typeof item.distanceKm === 'number') return item.distanceKm;
    return haversineKm(userLat, userLon, item.latitude, item.longitude);
  }, [item.distanceKm, userLat, userLon, item.latitude, item.longitude]);

  // Build infos as in your template, but with dynamic City
  const infos = [
    { type: 'Spare part', data: item.spareparts_type },
    { type: 'State',      data: formatState(item.state) },
    { type: 'City',       data: selectedCity || '—' },            // ✅ selected City from selector
    { type: 'Distance',   data: `${distanceKm.toFixed(2)} km` },
  ];

  return (
    <div className={'flex gap-6 py-4 px-6 flex-col xl:flex-row rounded-[8px] bg-white'}>
      <div className={'basis-[50%] flex gap-4 items-center'}>
        <img className={'rounded-full size-14'} src={`${BASE_URL}/images/${item.logo_img}`}/>
        <div className={'flex flex-col gap-0.5'}>
          {/* Replace "Performance Center" with branch_name */}
          <h4 className={'text-charcoal text-xl font-semibold'}>{item.branch_name}</h4>
          <div className={'flex items-center gap-1'}>
            {/* Show YellowStar icon only if stars is non-empty */}
            {(item.stars !== null && item.stars !== undefined) && (
              <img src={`/assets/icons/services/YellowStarIcon.svg`} width="17" />
            )}
            {/* Stars text */}
            <h6 className={'text-charcoal text-sm font-semibold'}>{item.stars}</h6>
          </div>
        </div>
      </div>

      <div className={'flex flex-wrap gap-6 items-center basis-full xl:basis-[50%]'}>
        {infos.map((info) => (
          <div key={info.type} className={'w-[96px] flex flex-col'}>
            <h5 className={'text-muted-gray text-sm'}>{info.type}</h5>
            <h5 className={'text-black text-base font-medium'}>{info.data}</h5>
          </div>
        ))}
        <CustomBlueBtn
          text={'Make Reservation'}
          className={'h-[40px] bg-white font-semibold border-[1.5px] border-steel-blue text-steel-blue py-3 px-4'}
          onClick={() => onRequest(item.branch_id)} // pass branch_id as requested
        />
      </div>
    </div>
  )
}

function SparePartsSearchResults() {
  const [rawResults, setRawResults] = useState<SparePartResult[]>([])
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number }>({ lat: 25.276987, lon: 55.296249 })
  const [sortOrder, setSortOrder] = useState<SortOrder>('all')
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined)  // ✅
  
  // Load results, user location, and selected city written by selectors page
   useEffect(() => {
    try {
      const r = JSON.parse(sessionStorage.getItem('sp_search_results') || '[]');
      const loc = JSON.parse(sessionStorage.getItem('sp_user_location') || '{"lat":25.276987,"lon":55.296249}')
      setRawResults(Array.isArray(r) ? r : [])
      if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
        setUserLoc({ lat: loc.lat, lon: loc.lon })
      }

      // ✅ read selected city name from payload saved by the selectors step
      const payload = JSON.parse(sessionStorage.getItem('sp_search_payload') || '{}')
      if (payload && typeof payload.city === 'string') {
        setSelectedCity(payload.city)
      }
    } catch {
      setRawResults([])
      setUserLoc({ lat: 25.276987, lon: 55.296249 })
      setSelectedCity(undefined)
    }
  }, [])

  // Distance decoration
  const resultsWithDistance = useMemo(() => {
    return rawResults.map(it => ({
      ...it,
      distanceKm: haversineKm(userLoc.lat, userLoc.lon, it.latitude, it.longitude),
    }))
  }, [rawResults, userLoc.lat, userLoc.lon])

  // Sort per ShopDistanceSelector
  const sortedResults = useMemo(() => {
    if (sortOrder === 'closest') {
      return [...resultsWithDistance].sort((a, b) => (a.distanceKm! - b.distanceKm!))
    }
    if (sortOrder === 'farthest') {
      return [...resultsWithDistance].sort((a, b) => (b.distanceKm! - a.distanceKm!))
    }
    return resultsWithDistance
  }, [resultsWithDistance, sortOrder])

  const handleRequest = (branchId: number) => {
    // Place where you route / open modal using branchId if needed
    console.log('Request clicked for branch_id:', branchId)
  }

  return (
    <div className={'flex flex-col gap-y-5'}>
      <h5 className={'text-dark-gray text-sm font-medium'}>Search results</h5>

      <div className={'flex flex-col gap-3'}>
        <h5 className={'text-dark-gray text-sm font-medium'}>Filter by</h5>
        <div className={'max-w-full sm:max-w-[75%] xl:max-w-[50%] grid grid-cols-1 450:grid-cols-3 gap-3'}>
          {/* keep first two placeholders consistent with your template */}
          <ShopDistanceSelector
            placeholder="Shop distance"
            onChange={(v?: string) => setSortOrder((v as SortOrder) || 'all')}
          />
        </div>
      </div>

      <div className={'flex flex-col gap-y-4'}>
        {sortedResults.map((item, idx) => (
          <ResultCard
            key={`${item.branch_id}-${idx}`}
            item={item}
            userLat={userLoc.lat}
            userLon={userLoc.lon}
            onRequest={handleRequest}
            selectedCity={selectedCity}        // ✅ pass city down
          />
        ))}
        {sortedResults.length === 0 && (
          <div className="py-4 text-sm text-muted-gray">No results found.</div>
        )}
      </div>
    </div>
  )
}

export default memo(SparePartsSearchResults)
