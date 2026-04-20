"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OptionItem {
  id: string;
  label: string;
}

interface UserDetails {
  gender: string;
  dob: string;
  age: number | "";
  sexualOrientation: string;
  maritalStatus: string;
  occupation: string;
}

interface DoctorDetails {
  fullName: string;
  gender: string;
  dob: string;
  age: number | "";
  specializations: string[];
  yearsOfExperience: string;
  licenceNumber: string;
  avatar: string | null;  // Base64 encoded avatar
}

// ─── Dropdown options ─────────────────────────────────────────────────────────
const GENDER_OPTIONS: OptionItem[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "non_binary", label: "Non-binary" },
  { id: "transgender_male", label: "Transgender male" },
  { id: "transgender_female", label: "Transgender female" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

const SEXUAL_ORIENTATION_OPTIONS: OptionItem[] = [
  { id: "heterosexual_straight", label: "Heterosexual (Straight)" },
  { id: "homosexual", label: "Homosexual" },
  { id: "bisexual", label: "Bisexual" },
  { id: "asexual", label: "Asexual" },
  { id: "pansexual", label: "Pansexual" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

const MARITAL_STATUS_OPTIONS: OptionItem[] = [
  { id: "single", label: "Single" },
  { id: "in_a_relationship", label: "In a relationship" },
  { id: "engaged", label: "Engaged" },
  { id: "married", label: "Married" },
  { id: "divorced", label: "Divorced" },
  { id: "separated", label: "Separated" },
  { id: "widowed", label: "Widowed" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

const SPECIALIZATIONS: OptionItem[] = [
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "trauma_ptsd", label: "Trauma & PTSD" },
  { id: "grief", label: "Grief" },
  { id: "relationships", label: "Relationships" },
  { id: "family_therapy", label: "Family Therapy" },
  { id: "addiction", label: "Addiction" },
  { id: "eating_disorders", label: "Eating Disorders" },
  { id: "ocd", label: "OCD" },
  { id: "adhd", label: "ADHD" },
  { id: "bipolar", label: "Bipolar" },
  { id: "stress_management", label: "Stress Management" },
  { id: "life_coaching", label: "Life Coaching" },
  { id: "child_psychology", label: "Child Psychology" },
  { id: "adolescents", label: "Adolescents" },
  { id: "couples_therapy", label: "Couples Therapy" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob: string): number | "" {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : "";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // Remove the data:image/* prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Avatar Upload Component ──────────────────────────────────────────────────
function AvatarUpload({
  avatar, onChange, disabled,
}: {
  avatar: string | null;
  onChange: (base64: string) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      alert("Error processing image");
    }
  };

  const displayUrl = previewUrl || (avatar ? `data:image/png;base64,${avatar}` : null);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      
      <div className="flex items-center gap-4">
        <div className="relative">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar preview"
              className="w-24 h-24 rounded-lg object-cover border-2 border-purple-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-4 py-2.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload Avatar
        </button>
      </div>
      <p className="text-xs text-gray-400">Max 5MB • PNG, JPEG, GIF, WebP</p>
    </div>
  );
}

// ─── Portal Dropdown ──────────────────────────────────────────────────────────
function Dropdown({
  label, value, options, onChange, disabled,
}: {
  label: string;
  value: string;
  options: OptionItem[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const handleRepos = () => updatePosition();
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleRepos, true);
    window.addEventListener("resize", handleRepos);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleRepos, true);
      window.removeEventListener("resize", handleRepos);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all bg-white
          ${value ? "text-gray-800" : "text-gray-400"}
          ${open ? "border-[#980194] ring-2 ring-purple-100" : "border-gray-200 hover:border-purple-300"}`}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors
                  ${value === opt.id ? "bg-purple-50 text-[#980194] font-medium" : "text-gray-700"}`}
              >
                {value === opt.id && <CheckCircle2 className="w-3.5 h-3.5 inline mr-2 text-[#980194]" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Portal Calendar Picker ───────────────────────────────────────────────────
function CalendarPicker({
  value, onChange, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [viewYear, setViewYear] = useState(() => value ? new Date(value).getFullYear() : new Date().getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value).getMonth() : new Date().getMonth());
  const [mode, setMode] = useState<"calendar" | "year">("calendar");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: 288,
      zIndex: 9999,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const handleRepos = () => updatePosition();
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleRepos, true);
    window.addEventListener("resize", handleRepos);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleRepos, true);
      window.removeEventListener("resize", handleRepos);
    };
  }, [open]);

  const selected = value ? new Date(value) : null;
  const today = new Date();
  const maxYear = today.getFullYear() - 10;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const handleDayClick = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const years = Array.from({ length: maxYear - 1900 + 1 }, (_, i) => maxYear - i);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all bg-white
          ${displayValue ? "text-gray-800" : "text-gray-400"}
          ${open ? "border-[#980194] ring-2 ring-purple-100" : "border-gray-200 hover:border-purple-300"}`}
      >
        <span>{displayValue || "Select date of birth"}</span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
        >
          {mode === "calendar" ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50">
                <button type="button" onClick={prevMonth} className="p-1 hover:bg-purple-100 rounded-lg">
                  <ChevronLeft className="w-4 h-4 text-purple-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("year")}
                  className="text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  {monthNames[viewMonth]} {viewYear}
                </button>
                <button type="button" onClick={nextMonth} className="p-1 hover:bg-purple-100 rounded-lg">
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 px-3 pt-2">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected = selected &&
                    selected.getFullYear() === viewYear &&
                    selected.getMonth() === viewMonth &&
                    selected.getDate() === day;
                  const isFuture = new Date(viewYear, viewMonth, day) > today;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleDayClick(day)}
                      className={`text-center text-xs py-1.5 rounded-lg transition-all
                        ${isSelected ? "bg-[#980194] text-white font-bold" : ""}
                        ${!isSelected && !isFuture ? "hover:bg-purple-50 text-gray-700" : ""}
                        ${isFuture ? "text-gray-200 cursor-not-allowed" : ""}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-700">Select Year</span>
                <button type="button" onClick={() => setMode("calendar")} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
              </div>
              <div className="max-h-52 overflow-y-auto grid grid-cols-3 gap-1">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { setViewYear(y); setMode("calendar"); }}
                    className={`text-xs py-2 rounded-lg transition-all
                      ${viewYear === y ? "bg-[#980194] text-white font-bold" : "hover:bg-purple-50 text-gray-700"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Age Badge ────────────────────────────────────────────────────────────────
function AgeBadge({ age }: { age: number | "" }) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={age !== "" ? `${age} yrs` : ""}
        disabled
        placeholder="Auto"
        className="bg-gray-50 border-gray-200 text-gray-500 text-sm cursor-not-allowed"
      />
      {age !== "" && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white px-2 py-0.5 rounded-full font-medium">
          {age}
        </span>
      )}
    </div>
  );
}

// ─── Specialization Pill Grid ─────────────────────────────────────────────────
function SpecializationGrid({
  options,
  selected,
  onToggle,
}: {
  options: OptionItem[];
  selected: string[];
  onToggle: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((s) => {
        const active = selected.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${active
                ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white border-transparent shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
              }`}
          >
            {active && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

interface UserDetailsFormProps {
  role: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserDetailsForm({ role }: UserDetailsFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [userDetails, setUserDetails] = useState<UserDetails>({
    gender: "", dob: "", age: "",
    sexualOrientation: "", maritalStatus: "", occupation: "",
  });

  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails>({
    fullName: "", gender: "", dob: "", age: "",
    specializations: [], yearsOfExperience: "", licenceNumber: "", avatar: null,
  });

  useEffect(() => {
    if (role === "user") setUserDetails((p) => ({ ...p, age: calcAge(p.dob) }));
  }, [userDetails.dob, role]);

  useEffect(() => {
    if (role === "counselor") setDoctorDetails((p) => ({ ...p, age: calcAge(p.dob) }));
  }, [doctorDetails.dob, role]);

  const handleNext = async () => {
    setLoading(true);
    const data = role === "user" ? userDetails : doctorDetails;
    try {
      await apiClient.post("/profile/setup", { data });

      // Dashboard route renders role-specific dashboard UI.
      if (role === "user") {
        router.replace("/profile");
        return;
      }

      if (role === "counselor") {
        router.replace("/profile");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const isUserValid = !!userDetails.gender && !!userDetails.dob && !!userDetails.sexualOrientation && !!userDetails.maritalStatus;
  const isDoctorValid = !!doctorDetails.fullName && !!doctorDetails.gender && !!doctorDetails.dob && doctorDetails.specializations.length > 0 && !!doctorDetails.yearsOfExperience && !!doctorDetails.licenceNumber;
  const isValid = role === "user" ? isUserValid : isDoctorValid;

  if (role !== "user" && role !== "counselor") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-none shadow-2xl text-center p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Error occurred</h2>
          <p className="text-gray-500 mt-2">An unexpected error occurred. Please try again.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center p-4 w-full">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-200 rounded-full opacity-20 -translate-x-16 -translate-y-16 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-200 rounded-full opacity-20 translate-x-12 translate-y-12 blur-2xl pointer-events-none" />

        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <img src="/images/logo3.png" alt="Logo" className="w-10 h-10 mr-2 opacity-20" />
            <div className="text-right">
              <h1 className="text-3xl font-medium text-[#980194]">
                {role === "user" ? "User – Details" : "Doctor – Details"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {role === "user" ? "Tell us a little about yourself" : "Set up your professional profile"}
              </p>
            </div>
          </div>
        </CardHeader>

        {/* No overflow-hidden on the card scroll container — use overflow-visible so portals work */}
        <CardContent className="space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto px-6 pb-8">

          {role === "user" && (
            <div className="space-y-5">
              <Field label="Gender">
                <Dropdown label="Select Gender" value={userDetails.gender} options={GENDER_OPTIONS}
                  onChange={(v) => setUserDetails((p) => ({ ...p, gender: v }))} disabled={loading} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth">
                  <CalendarPicker value={userDetails.dob}
                    onChange={(v) => setUserDetails((p) => ({ ...p, dob: v }))} disabled={loading} />
                </Field>
                <Field label="Age"><AgeBadge age={userDetails.age} /></Field>
              </div>

              <Field label="Sexual Orientation">
                <Dropdown label="Select Sexual Orientation" value={userDetails.sexualOrientation}
                  options={SEXUAL_ORIENTATION_OPTIONS}
                  onChange={(v) => setUserDetails((p) => ({ ...p, sexualOrientation: v }))} disabled={loading} />
              </Field>

              <Field label="Marital Status">
                <Dropdown label="Select Marital Status" value={userDetails.maritalStatus}
                  options={MARITAL_STATUS_OPTIONS}
                  onChange={(v) => setUserDetails((p) => ({ ...p, maritalStatus: v }))} disabled={loading} />
              </Field>

              <Field label="Occupation">
                <Input type="text" placeholder="e.g. Software Engineer" value={userDetails.occupation}
                  disabled={loading} onChange={(e) => setUserDetails((p) => ({ ...p, occupation: e.target.value }))}
                  className="bg-white border-gray-200 focus-visible:ring-purple-400" />
              </Field>
            </div>
          )}

          {role === "counselor" && (
            <div className="space-y-5">
              <Field label="Avatar">
                <AvatarUpload
                  avatar={doctorDetails.avatar}
                  onChange={(base64) => setDoctorDetails((p) => ({ ...p, avatar: base64 }))}
                  disabled={loading}
                />
              </Field>

              <Field label="Full Name">
                <Input type="text" placeholder="Dr. Jane Smith" value={doctorDetails.fullName}
                  disabled={loading} onChange={(e) => setDoctorDetails((p) => ({ ...p, fullName: e.target.value }))}
                  className="bg-white border-gray-200 focus-visible:ring-purple-400" />
              </Field>

              <Field label="Gender">
                <Dropdown label="Select Gender" value={doctorDetails.gender} options={GENDER_OPTIONS}
                  onChange={(v) => setDoctorDetails((p) => ({ ...p, gender: v }))} disabled={loading} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth">
                  <CalendarPicker value={doctorDetails.dob}
                    onChange={(v) => setDoctorDetails((p) => ({ ...p, dob: v }))} disabled={loading} />
                </Field>
                <Field label="Age"><AgeBadge age={doctorDetails.age} /></Field>
              </div>

              <Field label="Specialization">
                <SpecializationGrid options={SPECIALIZATIONS} selected={doctorDetails.specializations}
                  onToggle={(s) => setDoctorDetails((p) => ({
                    ...p,
                    specializations: p.specializations.includes(s)
                      ? p.specializations.filter((x) => x !== s)
                      : [...p.specializations, s],
                  }))} />
                {doctorDetails.specializations.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Select at least one specialization</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Years of Experience">
                  <Input type="number" min={0} max={60} placeholder="e.g. 5" value={doctorDetails.yearsOfExperience}
                    disabled={loading} onChange={(e) => setDoctorDetails((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                    className="bg-white border-gray-200 focus-visible:ring-purple-400" />
                </Field>
                <Field label="Licence Number">
                  <Input type="text" placeholder="e.g. PSY-12345" value={doctorDetails.licenceNumber}
                    disabled={loading} onChange={(e) => setDoctorDetails((p) => ({ ...p, licenceNumber: e.target.value }))}
                    className="bg-white border-gray-200 focus-visible:ring-purple-400" />
                </Field>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleNext}
            disabled={loading || !isValid}
            className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            size="lg"
          >
            {loading ? "Saving…" : "NEXT"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}