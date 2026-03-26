"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation, X, Check, Plus, Loader2 } from "lucide-react";
import { useMyProfile, useUpdateProfile, useAddAddress } from "@/lib/hooks/useUsers";
import { logisticsService } from "@/lib/api/logistics.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationOption {
  id: number;
  name: string;
  zip_code?: string;
}

interface SelectedLocation {
  prov: string;
  city: string;
  dist: string;
  subdist: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface FormErrors {
  firstName?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  street?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LABELS = ["Home", "Work", "Appartement"];
const DEFAULT_COORDS: Coordinates = { lat: -6.2088, lng: 106.8456 }; // Jakarta

const EMPTY_LOCATION: SelectedLocation = {
  prov: "",
  city: "",
  dist: "",
  subdist: "",
};

// ─── Reverse Geocoding ────────────────────────────────────────────────────────
// Uses OpenStreetMap Nominatim – free, no API key required.

interface NominatimAddress {
  state?: string;         // Province  e.g. "Jawa Barat"
  city?: string;          // City      e.g. "Kota Bandung"
  regency?: string;       // Kabupaten fallback
  county?: string;        // another city fallback
  district?: string;      // Kecamatan e.g. "Coblong"
  suburb?: string;        // Kelurahan fallback
  village?: string;       // Kelurahan e.g. "Lebak Siliwangi"
  neighbourhood?: string; // Kelurahan fallback
  postcode?: string;
}

interface ReverseGeocodeResult {
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postcode: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "id" } } // prefer Indonesian names
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr: NominatimAddress = data.address ?? {};

    return {
      province:    addr.state ?? "",
      city:        addr.city ?? addr.regency ?? addr.county ?? "",
      district:    addr.district ?? addr.suburb ?? "",
      subdistrict: addr.village ?? addr.neighbourhood ?? addr.suburb ?? "",
      postcode:    addr.postcode ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Strips common Indonesian administrative prefixes so "Kota Bandung"
 * matches "Bandung", "Kecamatan Coblong" matches "Coblong", etc.
 * Lowercases and trims for case-insensitive comparison.
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(kota|kabupaten|kab\.|kecamatan|kec\.|kelurahan|kel\.|desa)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds the best match from a list of LocationOption by comparing
 * normalized names. Returns null if no reasonable match is found.
 */
function findBestMatch(
  query: string,
  options: LocationOption[]
): LocationOption | null {
  if (!query || options.length === 0) return null;
  const normQuery = normalize(query);

  // 1. Exact normalized match
  const exact = options.find((o) => normalize(o.name) === normQuery);
  if (exact) return exact;

  // 2. One contains the other
  const contains = options.find(
    (o) => normalize(o.name).includes(normQuery) || normQuery.includes(normalize(o.name))
  );
  return contains ?? null;
}

// ─── MapPicker Component ──────────────────────────────────────────────────────

interface MapPickerProps {
  coordinates: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
}

function MapPicker({ coordinates, onCoordinatesChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef  = useRef<any>(null);
  const markerRef       = useRef<any>(null);
  const [locating, setLocating]           = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Inject Leaflet CSS once
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id   = "leaflet-css";
    link.rel  = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  // Initialise map on mount
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapContainerRef.current!, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 15,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;
          background:#f97316;border:3px solid white;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onCoordinatesChange({ lat, lng });
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onCoordinatesChange({ lat, lng });
      });

      mapInstanceRef.current = map;
      markerRef.current      = marker;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current      = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker + view when coords change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
    mapInstanceRef.current.flyTo([coordinates.lat, coordinates.lng], 16, { duration: 1.2 });
  }, [coordinates]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordinatesChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location permission denied. Please allow access in your browser settings."
            : "Unable to retrieve your location."
        );
        setLocating(false);
      },
      { timeout: 10_000, enableHighAccuracy: true }
    );
  }, [onCoordinatesChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-5 h-5 text-orange-500" />
          <span className="text-sm italic">Pin your address</span>
        </div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs text-orange-500 border border-orange-300 rounded-full px-3 py-1 hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <Navigation className="w-3.5 h-3.5" />
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      {locationError && <p className="text-xs text-red-500">{locationError}</p>}

      <div
        ref={mapContainerRef}
        className="w-full h-52 rounded-md overflow-hidden border border-gray-300"
        style={{ zIndex: 0 }}
      />

      <p className="text-[10px] text-gray-400 text-center">
        Tap the map or drag the pin to set your exact location
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-md px-3 py-1.5 text-center">
          <p className="text-[10px] text-gray-400">Latitude</p>
          <p className="text-xs font-mono text-gray-700">{coordinates.lat.toFixed(6)}</p>
        </div>
        <div className="bg-gray-50 rounded-md px-3 py-1.5 text-center">
          <p className="text-[10px] text-gray-400">Longitude</p>
          <p className="text-xs font-mono text-gray-700">{coordinates.lng.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SetupProfilePage() {
  const router = useRouter();

  const { data: profile } = useMyProfile();
  const updateProfile     = useUpdateProfile();
  const addAddress        = useAddAddress();

  // ── Label state ───────────────────────────────────────────────────────────
  const [labels, setLabels]           = useState<string[]>(DEFAULT_LABELS);
  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState("");
  const [labelError, setLabelError]       = useState<string | null>(null);
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [firstName, setFirstName]       = useState("");
  const [lastName,  setLastName]        = useState("");
  const [phone,     setPhone]           = useState("");
  const [street,    setStreet]          = useState("");
  const [postalCode, setPostalCode]     = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(EMPTY_LOCATION);
  const [coordinates, setCoordinates]   = useState<Coordinates>(DEFAULT_COORDS);

  // ── Dropdown data ─────────────────────────────────────────────────────────
  const [provinces,    setProvinces]    = useState<LocationOption[]>([]);
  const [cities,       setCities]       = useState<LocationOption[]>([]);
  const [districts,    setDistricts]    = useState<LocationOption[]>([]);
  const [subdistricts, setSubdistricts] = useState<LocationOption[]>([]);

  // ── Loading states ────────────────────────────────────────────────────────
  const [loadingProvinces,    setLoadingProvinces]    = useState(false);
  const [loadingCities,       setLoadingCities]       = useState(false);
  const [loadingDistricts,    setLoadingDistricts]    = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);
  const [geocoding,           setGeocoding]           = useState(false);
  const [geocodeError,        setGeocodeError]        = useState<string | null>(null);

  // ── Validation ────────────────────────────────────────────────────────────
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      const [first = "", ...rest] = (profile.name || "").split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    setLoadingProvinces(true);
    logisticsService
      .getProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (isAddingLabel) newLabelInputRef.current?.focus();
  }, [isAddingLabel]);

  // ── Reverse geocode: auto-fill dropdowns from coordinates ─────────────────
  // Called when the user moves the pin or uses "Use my location".
  const fillFromCoordinates = useCallback(
    async (coords: Coordinates, currentProvinces: LocationOption[]) => {
      setGeocoding(true);
      setGeocodeError(null);

      const result = await reverseGeocode(coords.lat, coords.lng);
      if (!result) {
        setGeocoding(false);
        setGeocodeError("Could not look up address for this location.");
        return;
      }
      console.log(result);
      
    let provinceName = result.province;
    let cityName = result.city;

    if (!provinceName && cityName.toLowerCase().includes("jakarta")) {
    provinceName = "DKI Jakarta";
    }

    // ── 1. Match Province ────────────────────────────────────────
    const matchedProv = findBestMatch(provinceName, currentProvinces);
      if (!matchedProv) {
        setGeocoding(false);
        setGeocodeError(`Province not found for "${result.province}". Please select manually.`);
        return;
      }

      setSelectedLocation({ ...EMPTY_LOCATION, prov: String(matchedProv.id) });
      setCities([]); setDistricts([]); setSubdistricts([]);
      setPostalCode("");
      setErrors((prev) => ({ ...prev, province: undefined }));

      // ── 2. Fetch & match City ────────────────────────────────────────────
      setLoadingCities(true);
      let fetchedCities: LocationOption[] = [];
      try {
        fetchedCities = await logisticsService.getCities(matchedProv.id);
        setCities(fetchedCities);
      } catch {
        setLoadingCities(false);
        setGeocoding(false);
        return;
      }
      setLoadingCities(false);

      const matchedCity = findBestMatch(result.city, fetchedCities);
      if (!matchedCity) {
        setGeocoding(false);
        setGeocodeError(`City not found for "${result.city}". Please select manually.`);
        return;
      }

      setSelectedLocation((prev) => ({ ...prev, city: String(matchedCity.id), dist: "", subdist: "" }));
      setErrors((prev) => ({ ...prev, city: undefined }));

      // ── 3. Fetch & match District ────────────────────────────────────────
      setLoadingDistricts(true);
      let fetchedDistricts: LocationOption[] = [];
      try {
        fetchedDistricts = await logisticsService.getDistricts(matchedCity.id);
        setDistricts(fetchedDistricts);
      } catch {
        setLoadingDistricts(false);
        setGeocoding(false);
        return;
      }
      setLoadingDistricts(false);

      const matchedDist = findBestMatch(result.district, fetchedDistricts);
      if (!matchedDist) {
        setGeocoding(false);
        setGeocodeError(`District not found for "${result.district}". Please select manually.`);
        return;
      }

      setSelectedLocation((prev) => ({ ...prev, dist: String(matchedDist.id), subdist: "" }));
      setErrors((prev) => ({ ...prev, district: undefined }));

      // ── 4. Fetch & match Subdistrict ─────────────────────────────────────
      setLoadingSubdistricts(true);
      let fetchedSubdistricts: LocationOption[] = [];
      try {
        fetchedSubdistricts = await logisticsService.getSubdistricts(matchedDist.id);
        setSubdistricts(fetchedSubdistricts);
      } catch {
        setLoadingSubdistricts(false);
        setGeocoding(false);
        return;
      }
      setLoadingSubdistricts(false);

      const matchedSubdist = findBestMatch(result.subdistrict, fetchedSubdistricts);
      if (matchedSubdist) {
        setSelectedLocation((prev) => ({ ...prev, subdist: String(matchedSubdist.id) }));
        setPostalCode(matchedSubdist.zip_code ?? result.postcode ?? "");
        setErrors((prev) => ({ ...prev, subdistrict: undefined }));
      } else {
        // Subdistricts are granular — soft-fail and let the user pick
        setGeocodeError(`Subdistrict not matched for "${result.subdistrict}". Please select manually.`);
      }

      setGeocoding(false);
    },
    [] // provinces are passed as an argument to avoid stale-closure issues
  );

  // Trigger reverse geocoding whenever coordinates change
  useEffect(() => {
    if (provinces.length === 0) return; // wait until provinces are loaded
    fillFromCoordinates(coordinates, provinces);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  // Also trigger when provinces first load (in case coordinates were already set)
  useEffect(() => {
    if (provinces.length > 0) {
      fillFromCoordinates(coordinates, provinces);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces]);

  // ── Label handlers ────────────────────────────────────────────────────────

  const openAddLabel = () => { setIsAddingLabel(true); setNewLabelInput(""); setLabelError(null); };
  const cancelAddLabel = () => { setIsAddingLabel(false); setNewLabelInput(""); setLabelError(null); };

  const confirmAddLabel = () => {
    const trimmed = newLabelInput.trim();
    if (!trimmed) { setLabelError("Label cannot be empty."); return; }
    if (trimmed.length > 20) { setLabelError("Label must be 20 characters or fewer."); return; }
    if (labels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setLabelError("This label already exists."); return;
    }
    setLabels((prev) => [...prev, trimmed]);
    setSelectedLabel(trimmed);
    setIsAddingLabel(false);
    setNewLabelInput("");
    setLabelError(null);
  };

  const handleNewLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") confirmAddLabel();
    if (e.key === "Escape") cancelAddLabel();
  };

  console.log(coordinates);
  
  // ── Manual cascade handlers (override geocode result) ─────────────────────

  const handleProvChange = (provId: string) => {
    setSelectedLocation({ ...EMPTY_LOCATION, prov: provId });
    setCities([]); setDistricts([]); setSubdistricts([]);
    setPostalCode("");
    setErrors((prev) => ({ ...prev, province: undefined }));
    if (!provId) return;
    setLoadingCities(true);
    logisticsService.getCities(Number(provId)).then(setCities).catch(console.error).finally(() => setLoadingCities(false));
  };

  const handleCityChange = (cityId: string) => {
    setSelectedLocation((prev) => ({ ...prev, city: cityId, dist: "", subdist: "" }));
    setDistricts([]); setSubdistricts([]);
    setPostalCode("");
    setErrors((prev) => ({ ...prev, city: undefined }));
    if (!cityId) return;
    setLoadingDistricts(true);
    logisticsService.getDistricts(Number(cityId)).then(setDistricts).catch(console.error).finally(() => setLoadingDistricts(false));
  };

  const handleDistChange = (distId: string) => {
    setSelectedLocation((prev) => ({ ...prev, dist: distId, subdist: "" }));
    setSubdistricts([]);
    setPostalCode("");
    setErrors((prev) => ({ ...prev, district: undefined }));
    if (!distId) return;
    setLoadingSubdistricts(true);
    logisticsService.getSubdistricts(Number(distId)).then(setSubdistricts).catch(console.error).finally(() => setLoadingSubdistricts(false));
  };

  const handleSubdistChange = (subdistId: string) => {
    setSelectedLocation((prev) => ({ ...prev, subdist: subdistId }));
    setErrors((prev) => ({ ...prev, subdistrict: undefined }));
    const matched = subdistricts.find((s) => String(s.id) === subdistId);
    setPostalCode(matched?.zip_code ?? "");
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const indonesianPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!indonesianPhoneRegex.test(phone.trim())) {
      errs.phone = "Enter a valid Indonesian phone number (e.g. 08123456789).";
    }
    if (!selectedLocation.prov)   errs.province    = "Please select a province.";
    if (!selectedLocation.city)   errs.city        = "Please select a city.";
    if (!selectedLocation.dist)   errs.district    = "Please select a district.";
    if (!selectedLocation.subdist) errs.subdistrict = "Please select a subdistrict.";
    if (!street.trim()) errs.street = "Street address is required.";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSubmitError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      await updateProfile.mutateAsync({ name: fullName, phone: phone.trim() });
      await addAddress.mutateAsync({
        label: selectedLabel,
        recipientName: fullName,
        phone: phone.trim(),
        addressLine: street.trim(),
        postalCode,
        provinceId:    Number(selectedLocation.prov),
        cityId:        Number(selectedLocation.city),
        districtId:    Number(selectedLocation.dist),
        subdistrictId: Number(selectedLocation.subdist),
        // latitude:  coordinates.lat,
        // longitude: coordinates.lng,
        isDefault: true,
      });
      router.push("/account");
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSubmitError("Failed to save. Please check your inputs and try again.");
    }
  };

  const isSaving = updateProfile.isPending || addAddress.isPending;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 pb-20">

      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Setup Profile</h1>
      </header>

      <main className="flex-1 px-4 py-6 bg-white">

        {/* ── Address Labels ──────────────────────────────────────────────── */}
        <div className="mb-6 space-y-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 items-center">
            {labels.map((lbl) => (
              <button
                key={lbl}
                onClick={() => setSelectedLabel(lbl)}
                className={`px-4 py-1.5 rounded border text-sm whitespace-nowrap transition-colors ${
                  selectedLabel === lbl
                    ? "border-orange-500 text-orange-500 bg-orange-50"
                    : "border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {lbl}
              </button>
            ))}
            {!isAddingLabel && (
              <button
                onClick={openAddLabel}
                className="px-3 py-1.5 rounded border border-dashed border-gray-400 text-gray-500 text-sm hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>

          {isAddingLabel && (
            <div className="flex items-center gap-2">
              <input
                ref={newLabelInputRef}
                type="text"
                value={newLabelInput}
                onChange={(e) => { setNewLabelInput(e.target.value); setLabelError(null); }}
                onKeyDown={handleNewLabelKeyDown}
                placeholder="e.g. Parents' House"
                maxLength={20}
                className="flex-1 border border-orange-400 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button onClick={confirmAddLabel} className="p-1.5 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors" title="Confirm">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancelAddLabel} className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Cancel">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {labelError && <p className="text-xs text-red-500">{labelError}</p>}
        </div>

        <div className="space-y-5">

          {/* ── Name ──────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 italic">
              Enter your name<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text" placeholder="First Name" value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: undefined })); }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <input
                type="text" placeholder="Last Name" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* ── Email ─────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 italic">
              Your email<span className="text-red-500">*</span>
            </label>
            <input type="email" value={profile?.email ?? ""} disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400">Email cannot be changed here.</p>
          </div>

          {/* ── Phone ─────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 italic">
              Phone number<span className="text-red-500">*</span>
            </label>
            <input
              type="tel" placeholder="0812345xxx" value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* ── Address ───────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 italic">
                Your address<span className="text-red-500">*</span>
              </label>
              {/* Geocoding spinner */}
              {geocoding && (
                <span className="flex items-center gap-1 text-[10px] text-orange-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Auto-filling from pin…
                </span>
              )}
            </div>

            {/* Soft geocode error (non-blocking) */}
            {geocodeError && !geocoding && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                <p className="text-[11px] text-amber-700 leading-snug">{geocodeError}</p>
              </div>
            )}

            {/* Province */}
            <div>
              <select
                value={selectedLocation.prov}
                onChange={(e) => handleProvChange(e.target.value)}
                disabled={loadingProvinces || geocoding}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
              >
                <option value="">{loadingProvinces ? "Loading provinces…" : "Select Province"}</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
            </div>

            {/* City + District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedLocation.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedLocation.prov || loadingCities || geocoding}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                >
                  <option value="">{loadingCities ? "Loading…" : "Select City"}</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <select
                  value={selectedLocation.dist}
                  onChange={(e) => handleDistChange(e.target.value)}
                  disabled={!selectedLocation.city || loadingDistricts || geocoding}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 outline-none"
                >
                  <option value="">{loadingDistricts ? "Loading…" : "Select District"}</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>
            </div>

            {/* Subdistrict + Postal Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedLocation.subdist}
                  onChange={(e) => handleSubdistChange(e.target.value)}
                  disabled={!selectedLocation.dist || loadingSubdistricts || geocoding}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 outline-none"
                >
                  <option value="">{loadingSubdistricts ? "Loading…" : "Select Subdistrict"}</option>
                  {subdistricts.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.zip_code ?? "-"})</option>
                  ))}
                </select>
                {errors.subdistrict && <p className="text-xs text-red-500 mt-1">{errors.subdistrict}</p>}
              </div>
              <input
                type="text" placeholder="Postal Code" value={postalCode} readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-default"
              />
            </div>

            {/* Street */}
            <div>
              <input
                type="text" placeholder="Street" value={street}
                onChange={(e) => { setStreet(e.target.value); setErrors((p) => ({ ...p, street: undefined })); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
            </div>
          </div>

          {/* ── Map Pin ───────────────────────────────────────────────────── */}
          <MapPicker
            coordinates={coordinates}
            onCoordinatesChange={setCoordinates}
          />

        </div>
      </main>

      {submitError && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
          {submitError}
        </div>
      )}

      <div className="bg-white p-4 border-t border-gray-100 mt-auto">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3.5 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>

    </div>
  );
}