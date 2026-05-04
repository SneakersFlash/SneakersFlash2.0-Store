"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, X, Check, Plus, Loader2 } from "lucide-react";
import { logisticsService } from "@/lib/api/logistics.service";
import type { UserAddress, CreateUserAddressDto } from "@/types/user.types";

// ─── Helpers & Types ────────────────────────────────────────────────────────
interface LocationOption { id: number; name: string; zip_code?: string; }
interface Coordinates { lat: number; lng: number; }
interface FormErrors { recipientName?: string; phone?: string; province?: string; city?: string; district?: string; subdistrict?: string; addressLine?: string; label?: string; }

const DEFAULT_LABELS = ["Home", "Work"];
const DEFAULT_COORDS: Coordinates = { lat: -6.2088, lng: 106.8456 }; // Jakarta

async function reverseGeocode(lat: number, lng: number) {
    try {
        const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "id" } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const addr = data.address ?? {};
        return {
        province: addr.state ?? "",
        city: addr.city ?? addr.regency ?? addr.county ?? "",
        district: addr.district ?? addr.suburb ?? "",
        subdistrict: addr.village ?? addr.neighbourhood ?? addr.suburb ?? "",
        postcode: addr.postcode ?? "",
        };
    } catch {
        return null;
    }
    }

    function normalize(name: string): string {
    return name.toLowerCase().replace(/^(kota|kabupaten|kab\.|kecamatan|kec\.|kelurahan|kel\.|desa)\s+/i, "").replace(/\s+/g, " ").trim();
    }

    function findBestMatch(query: string, options: LocationOption[]): LocationOption | null {
    if (!query || options.length === 0) return null;
    const normQuery = normalize(query);
    const exact = options.find((o) => normalize(o.name) === normQuery);
    if (exact) return exact;
    return options.find((o) => normalize(o.name).includes(normQuery) || normQuery.includes(normalize(o.name))) ?? null;
    }

    // ─── MapPicker Sub-Component ────────────────────────────────────────────────
function MapPicker({ coordinates, onCoordinatesChange }: { coordinates: Coordinates; onCoordinatesChange: (c: Coordinates, userInitiated: boolean) => void }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    // FIX: keep a ref to the latest callback so map event handlers never
    // hold a stale closure (map is only initialised once, so without this
    // the handlers would always see the provinces[] from the first render).
    const onCoordinatesChangeRef = useRef(onCoordinatesChange);
    useEffect(() => { onCoordinatesChangeRef.current = onCoordinatesChange; }, [onCoordinatesChange]);

    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (document.getElementById("leaflet-css")) return;
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (mapInstanceRef.current || !mapContainerRef.current) return;
        import("leaflet").then((L) => {
        const map = L?.map(mapContainerRef.current!, { center: [coordinates.lat, coordinates.lng], zoom: 15 });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM", maxZoom: 19 }).addTo(map);
        const icon = L.divIcon({
            className: "",
            html: `<div style="width:28px;height:28px;background:#f97316;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
            iconSize: [28, 28], iconAnchor: [14, 28],
        });
        const marker = L.marker([coordinates.lat, coordinates.lng], { icon, draggable: true }).addTo(map);

        // Always call via ref so we get the latest version of the callback
        marker.on("dragend", () => {
            const { lat, lng } = marker.getLatLng();
            onCoordinatesChangeRef.current({ lat, lng }, true);
        });
        map.on("click", (e: any) => {
            marker.setLatLng([e.latlng.lat, e.latlng.lng]);
            onCoordinatesChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }, true);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        });
        return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; markerRef.current = null; };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.flyTo([coordinates.lat, coordinates.lng], 16, { duration: 1.2 });
    }, [coordinates]);

    const handleLocate = useCallback(() => {
        if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
        setLocating(true); setLocationError(null);
        navigator.geolocation.getCurrentPosition(
        (pos) => { onCoordinatesChangeRef.current({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true); setLocating(false); },
        (err) => { setLocationError("Unable to retrieve location."); setLocating(false); },
        { timeout: 10000, enableHighAccuracy: true }
        );
    }, []);

    return (
        <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 " />
            <span className="text-sm italic font-medium">Pin your address</span>
            </div>
            <button type="button" onClick={handleLocate} disabled={locating} className="flex items-center gap-1.5 text-xs shadow-sm bg-primary border  rounded-full px-3 py-1 hover:bg-orange-50 transition-colors disabled:opacity-50">
            <Navigation className="w-3.5 h-3.5" /> {locating ? "Locating…" : "Use my location"}
            </button>
        </div>
        {locationError && <p className="text-xs text-red-500">{locationError}</p>}
        <div ref={mapContainerRef} className="w-full h-52 rounded overflow-hidden border-2 border-gray-200" style={{ zIndex: 0 }} />
        </div>
    );
}

    // ─── Main Form Component ────────────────────────────────────────────────────
interface AddressFormProps {
    initialData?: Partial<UserAddress>;
    onSubmit: (data: CreateUserAddressDto) => void;
    isLoading: boolean;
    submitLabel: string;
}

export function AddressForm({ initialData, onSubmit, isLoading, submitLabel }: AddressFormProps) {
    const [labels, setLabels] = useState<string[]>(
        initialData?.label && !DEFAULT_LABELS.includes(initialData.label) 
        ? [...DEFAULT_LABELS, initialData.label] 
        : DEFAULT_LABELS
    );
    const [selectedLabel, setSelectedLabel] = useState(initialData?.label || "Home");
    const [isAddingLabel, setIsAddingLabel] = useState(false);
    const [newLabelInput, setNewLabelInput] = useState("");

    const [recipientName, setRecipientName] = useState(initialData?.recipientName || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [addressLine, setAddressLine] = useState(initialData?.addressLine || "");
    const [postalCode, setPostalCode] = useState(initialData?.postalCode || "");
    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);

    const [provId, setProvId] = useState<string>(initialData?.provinceId?.toString() || "");
    const [cityId, setCityId] = useState<string>(initialData?.cityId?.toString() || "");
    const [distId, setDistId] = useState<string>(initialData?.districtId?.toString() || "");
    const [subdistId, setSubdistId] = useState<string>(initialData?.subdistrictId?.toString() || "");

    const [coordinates, setCoordinates] = useState<Coordinates>({
        lat: initialData?.latitude || DEFAULT_COORDS.lat,
        lng: initialData?.longitude || DEFAULT_COORDS.lng,
    });

    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [subdistricts, setSubdistricts] = useState<LocationOption[]>([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch initial dropdown data if editing
    useEffect(() => {
        setLoadingProvinces(true);
        logisticsService.getProvinces().then(setProvinces).finally(() => setLoadingProvinces(false));
        
        if (initialData?.provinceId) logisticsService.getCities(initialData.provinceId).then(setCities);
        if (initialData?.cityId) logisticsService.getDistricts(initialData.cityId).then(setDistricts);
        if (initialData?.districtId) logisticsService.getSubdistricts(initialData.districtId).then(setSubdistricts);
    }, [initialData]);

    const handleCoordinatesChange = async (coords: Coordinates, userInitiated: boolean) => {
        setCoordinates(coords);
        if (!userInitiated) return;

        setGeocoding(true);
        setGeocodeError(null);

        const result = await reverseGeocode(coords.lat, coords.lng);
        if (!result) {
            setGeocodeError("Could not look up address for this location.");
            setGeocoding(false);
            return;
        }

        let provinceName = result.province;
        if (!provinceName && result.city.toLowerCase().includes("jakarta")) provinceName = "DKI Jakarta";

        const matchedProv = findBestMatch(provinceName, provinces);
        if (!matchedProv) {
            setGeocodeError(`Province not matched for "${provinceName}". Please select manually.`);
            setGeocoding(false);
            return;
        }

        setProvId(String(matchedProv.id)); setCityId(""); setDistId(""); setSubdistId("");
        const fetchedCities = await logisticsService.getCities(matchedProv.id);
        setCities(fetchedCities);

        const matchedCity = findBestMatch(result.city, fetchedCities);
        if (!matchedCity) {
            setGeocodeError(`City not matched for "${result.city}". Please select manually.`);
            setGeocoding(false);
            return;
        }

        setCityId(String(matchedCity.id));
        const fetchedDistricts = await logisticsService.getDistricts(matchedCity.id);
        setDistricts(fetchedDistricts);

        const matchedDist = findBestMatch(result.district, fetchedDistricts);
        if (!matchedDist) {
            setGeocodeError(`District not matched for "${result.district}". Please select manually.`);
            setGeocoding(false);
            return;
        }

        setDistId(String(matchedDist.id));
        const fetchedSubdistricts = await logisticsService.getSubdistricts(matchedDist.id);
        setSubdistricts(fetchedSubdistricts);

        const matchedSubdist = findBestMatch(result.subdistrict, fetchedSubdistricts);
        if (matchedSubdist) {
            setSubdistId(String(matchedSubdist.id));
            setPostalCode(matchedSubdist.zip_code || result.postcode);
        } else {
            setGeocodeError(`Subdistrict not matched for "${result.subdistrict}". Please select manually.`);
        }

        setGeocoding(false);
    };

    // Label Handlers
    const confirmAddLabel = () => {
        if (!newLabelInput.trim()) return;
        setLabels((prev) => [...prev, newLabelInput.trim()]);
        setSelectedLabel(newLabelInput.trim());
        setIsAddingLabel(false);
        setNewLabelInput("");
    };

    // Submit Handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs: FormErrors = {};
        if (!recipientName.trim()) errs.recipientName = "Required";
        if (!phone.trim()) errs.phone = "Required";
        if (!addressLine.trim()) errs.addressLine = "Required";
        if (!provId) errs.province = "Required";
        if (!cityId) errs.city = "Required";
        if (!distId) errs.district = "Required";
        if (!subdistId) errs.subdistrict = "Required";

        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        onSubmit({
        label: selectedLabel,
        recipientName,
        phone,
        addressLine,
        postalCode,
        provinceId: Number(provId),
        cityId: Number(cityId),
        districtId: Number(distId),
        subdistrictId: Number(subdistId),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        isDefault,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Address Labels ──────────────────────────────────────────────── */}
        <div className="space-y-2">
            <label className="text-[12px] font-reguler text-gray-700">Save address as</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 items-center">
            {labels.map((lbl) => (
                <button
                type="button" key={lbl} onClick={() => setSelectedLabel(lbl)}
                className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-colors border-2 ${
                    selectedLabel === lbl ? "border-primary text-primary-foreground bg-primary/10 font-bold" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                } focus:outline-none focus:ring-0 focus:border-primary`}
                >
                {lbl}
                </button>
            ))}
            {!isAddingLabel && (
                <button type="button" onClick={() => setIsAddingLabel(true)} className="px-3 py-2 rounded border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap focus:outline-none focus:ring-0 focus:border-primary">
                <Plus className="w-4 h-4" /> 
                </button>
            )}
            </div>
            {isAddingLabel && (
            <div className="flex items-center gap-2 mt-2">
                <input type="text" value={newLabelInput} onChange={(e) => setNewLabelInput(e.target.value)} placeholder="e.g. Parent's House" className="flex-1 border-2 border-primary rounded px-3 py-2 text-base focus:outline-none focus:ring-0 focus:border-primary" />
                <button type="button" onClick={confirmAddLabel} className="p-2.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-0 focus:border-primary"><Check className="w-4 h-4" /></button>
                <button type="button" onClick={() => setIsAddingLabel(false)} className="p-2.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-0 focus:border-primary"><X className="w-4 h-4" /></button>
            </div>
            )}
        </div>

        {/* ── Contact Info ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
            <label className="text-[12px] font-reguler text-gray-700">Recipient Name <span className="text-red-500">*</span></label>
            <input type="text" value={recipientName} onChange={(e) => { setRecipientName(e.target.value); setErrors(p => ({...p, recipientName: undefined})) }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary" placeholder="John Doe" />
            {errors.recipientName && <p className="text-xs text-red-500">{errors.recipientName}</p>}
            </div>
            <div className="space-y-1">
            <label className="text-[12px] font-reguler text-gray-700">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors(p => ({...p, phone: undefined})) }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary" placeholder="0812..." />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone} <span className="text-red-500">*</span></p>}
            </div>
        </div>

        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <MapPicker coordinates={coordinates} onCoordinatesChange={handleCoordinatesChange} />

        {/* ── Cascading Location ──────────────────────────────────────────── */}
        <div className="space-y-3">
            <div className="flex items-center gap-2">
            <label className="text-[12px] font-reguler text-gray-700">Your Address <span className="text-red-500">*</span></label>
            {geocoding && <span className="flex items-center gap-1 text-xs text-primary"><Loader2 className="w-3 h-3 animate-spin" /> Auto-filling...</span>}
            </div>
            {geocodeError && !geocoding && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <p className="text-xs text-amber-700 leading-snug">{geocodeError}</p>
            </div>
            )}
            
            <select value={provId} onChange={(e) => {
            setProvId(e.target.value); setCityId(""); setDistId(""); setSubdistId("");
            logisticsService.getCities(Number(e.target.value)).then(setCities);
            }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary bg-white">
            <option value="">Select Province </option>
            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3">
            <select value={cityId} disabled={!provId} onChange={(e) => {
                setCityId(e.target.value); setDistId(""); setSubdistId("");
                logisticsService.getDistricts(Number(e.target.value)).then(setDistricts);
            }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={distId} disabled={!cityId} onChange={(e) => {
                setDistId(e.target.value); setSubdistId("");
                logisticsService.getSubdistricts(Number(e.target.value)).then(setSubdistricts);
            }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <select value={subdistId} disabled={!distId} onChange={(e) => {
                setSubdistId(e.target.value);
                const match = subdistricts.find(s => String(s.id) === e.target.value);
                setPostalCode(match?.zip_code || "");
            }} className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">Select Subdistrict</option>
                {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="text" value={postalCode} readOnly placeholder="Postal Code" className="w-full border-2 border-gray-200 rounded px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 focus:border-primary" />
            </div>
        </div>

        <div className="space-y-1">
            <label className="text-[12px] font-reguler text-gray-700">Detailed Address</label>
            <textarea rows={3} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Street name, building, house number..." className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-0 focus:border-primary resize-none" />
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded border border-gray-200">
            <input type="checkbox" id="isDefault" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-5 h-5 text-primary rounded focus:ring-primary focus:ring-offset-0 focus:outline-none border-gray-300" />
            <label htmlFor="isDefault" className="text-[12px] font-reguler text-gray-800 cursor-pointer">Set as Default Address</label>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground font-bold py-4 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            {isLoading ? "Saving..." : submitLabel}
        </button>
        </form>
    );
}