"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User, useUser } from "@/app/(application)/layout";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpecializationChips from "@/components/SpecializationChips";
import { SpecializationGrid } from "../components/SpecializationGrid";
import { OptionItem, SPECIALIZATIONS } from "../components/ProfileSetupForm";

type ProfileMeResponse = {
	role: string;
	profile: UserProfile | CounselorProfile;
};

type UserProfile = {
	userid: string;
	dob: string | null;
	age: number | null;
	gender: string | null;
	sexual_orientation: string | null;
	marital_status: string | null;
	occupation: string | null;
	avatar: string | null;
};

type CounselorProfile = {
	userid: string;
	full_name: string | null;
	dob: string | null;
	age: number | null;
	gender: string | null;
	licence_number: string | null;
	years_of_experience: number | null;
	specializations: string;
	avatar: string | null;
};

type UserProfileForm = {
	gender: string;
	dob: string;
	sexualOrientation: string;
	maritalStatus: string;
	occupation: string;
	avatar: string | null;
};

type CounselorProfileForm = {
	fullName: string;
	gender: string;
	dob: string;
	licenceNumber: string;
	yearsOfExperience: string;
	specializations: string;
	avatar: string | null;
};

function formatDate(value: string | null | undefined) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function toDateInputValue(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}

function computeAgeFromDob(dob: string): number | "" {
	if (!dob) return "";
	const birth = new Date(dob);
	if (Number.isNaN(birth.getTime())) return "";
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDelta = today.getMonth() - birth.getMonth();
	if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age >= 0 ? age : "";
}

function toUserForm(profile: UserProfile): UserProfileForm {
	return {
		gender: profile.gender ?? "",
		dob: toDateInputValue(profile.dob),
		sexualOrientation: profile.sexual_orientation ?? "",
		maritalStatus: profile.marital_status ?? "",
		occupation: profile.occupation ?? "",
		avatar: profile.avatar ?? null,
	};
}

function toCounselorForm(profile: CounselorProfile): CounselorProfileForm {
	return {
		fullName: profile.full_name ?? "",
		gender: profile.gender ?? "",
		dob: toDateInputValue(profile.dob),
		licenceNumber: profile.licence_number ?? "",
		yearsOfExperience: profile.years_of_experience != null ? String(profile.years_of_experience) : "",
		specializations: profile.specializations ?? "",
		avatar: profile.avatar ?? null,
	};
}

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
	return (
		<div className="space-y-1 rounded-lg border border-gray-100 bg-white p-3">
			<p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
			<p className="text-sm font-medium text-gray-800">{value ?? "-"}</p>
		</div>
	);
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

function AvatarDisplay({ avatar }: { avatar: string | null }) {
	if (!avatar) {
		return (
			<div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
				<span className="text-xs text-gray-400">No avatar</span>
			</div>
		);
	}
	return (
		<img
			src={`data:image/png;base64,${avatar}`}
			alt="Avatar"
			className="w-24 h-24 rounded-lg object-cover border-2 border-purple-200"
		/>
	);
}

function AvatarUploadField({
	avatar,
	onAvatarChange,
	disabled,
}: {
	avatar: string | null;
	onAvatarChange: (base64: string) => void;
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
			onAvatarChange(base64);
			setPreviewUrl(URL.createObjectURL(file));
		} catch (error) {
			alert("Error processing image");
		}
	};

	const displayUrl = previewUrl || (avatar ? `data:image/png;base64,${avatar}` : null);

	return (
		<div className="space-y-2">
			<p className="text-xs uppercase tracking-wide text-gray-500">Avatar</p>
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

				<div className="space-y-2">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={disabled}
						className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Change Avatar
					</button>
					<p className="text-xs text-gray-400">Max 5MB • PNG, JPEG, GIF</p>
				</div>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={disabled}
				className="hidden"
			/>
		</div>
	);
}

export default function ProfilePage() {
	const user = useUser() as User | null;
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [counselorProfile, setCounselorProfile] = useState<CounselorProfile | null>(null);
	const [userForm, setUserForm] = useState<UserProfileForm | null>(null);
	const [counselorForm, setCounselorForm] = useState<CounselorProfileForm | null>(null);

	const role = useMemo(() => (user?.role ?? "").toLowerCase(), [user]);

	useEffect(() => {
		if (!role) {
			setLoading(false);
			return;
		}

		const fetchProfile = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await apiClient.get<ProfileMeResponse>("/profile/me");
				if (!res.success) {
					throw new Error(res.message || "Failed to fetch profile");
				}

				if ((res.data.role ?? "").toLowerCase() === "user") {
					const profile = res.data.profile as UserProfile;
					setUserProfile(profile);
					setUserForm(toUserForm(profile));
					setCounselorProfile(null);
					setCounselorForm(null);
				} else {
					const profile = res.data.profile as CounselorProfile;
					setCounselorProfile(profile);
					setCounselorForm(toCounselorForm(profile));
					setUserProfile(null);
					setUserForm(null);
				}
			} catch (e: unknown) {
				const message = e instanceof Error ? e.message : "Unable to load profile";
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [role]);

	const handleCancel = () => {
		if (role === "user" && userProfile) {
			setUserForm(toUserForm(userProfile));
		}
		if (role !== "user" && counselorProfile) {
			setCounselorForm(toCounselorForm(counselorProfile));
		}
		setIsEditing(false);
	};

	const handleLogout = async () => {
		try {
			const response = await apiClient.post("/login/revoke-session");
			if (response.success) {
				window.location.href = "/signin";
			} else {
				console.error("Logout failed:", response.message || "Unknown error");
			}
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		try {
			if (role === "user" && userForm) {
				const payload = {
					gender: userForm.gender,
					dob: userForm.dob,
					sexualOrientation: userForm.sexualOrientation,
					maritalStatus: userForm.maritalStatus,
					occupation: userForm.occupation,
					avatar: userForm.avatar,
				};
				
				const res = await apiClient.patch<ProfileMeResponse>("/profile/me", { data: payload });
				const updated = res.data.profile as UserProfile;
				setUserProfile(updated);
				setUserForm(toUserForm(updated));
			}

			if (role !== "user" && counselorForm) {

				const payload: any = {
					fullName: counselorForm.fullName,
					gender: counselorForm.gender,
					dob: counselorForm.dob,
					licenceNumber: counselorForm.licenceNumber,
					yearsOfExperience: counselorForm.yearsOfExperience,
					specializations: counselorForm.specializations,
				};

				// Include avatar if it was changed
				if (counselorForm.avatar) {
					payload.avatar = counselorForm.avatar;
				}

				const res = await apiClient.patch<ProfileMeResponse>("/profile/me", { data: payload });
				const updated = res.data.profile as CounselorProfile;
				setCounselorProfile(updated);
				setCounselorForm(toCounselorForm(updated));
			}

			setIsEditing(false);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Unable to update profile");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#980194]" />
			</div>
		);
	}

	if (!role) {
		return (
			<div className="flex-1 flex items-center justify-center p-4">
				<Card className="w-full max-w-xl border-gray-100 shadow-xl">
					<CardHeader>
						<h1 className="text-xl font-semibold text-gray-800">Profile unavailable</h1>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">Could not resolve the logged in user.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex items-center justify-center p-4">
				<Card className="w-full max-w-xl border-gray-100 shadow-xl">
					<CardHeader>
						<h1 className="text-xl font-semibold text-gray-800">Failed to load profile</h1>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl p-4 md:p-6">
			<Card className="border-gray-100 shadow-xl">
				<CardHeader className="space-y-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-[#980194]">My Profile - {role === "user" ? "User" : "Counselor"}</p>
						<p className="text-gray-500 pt-2">Username: {user?.username ?? "-"}</p>
						<p className="text-gray-500">Email: {user?.email ?? "-"}</p>
					</div>

					<div className="flex items-center gap-2">
						{isEditing ? (
							<>
								<Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
									Cancel
								</Button>
								<Button type="button" onClick={handleSave} disabled={saving}>
									{saving ? "Saving..." : "Save Changes"}
								</Button>
							</>
						) : (
							<>
								<Button type="button" onClick={() => setIsEditing(true)}>
									Edit Profile
								</Button>
								<Button type="button" onClick={handleLogout}>
									Logout
								</Button>
							</>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{role === "user" && userProfile && !isEditing && (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div className="space-y-2">
								<p className="text-xs uppercase tracking-wide text-gray-500">Avatar</p>
								<AvatarDisplay avatar={userProfile.avatar} />
							</div>
							<ProfileField label="Date of Birth" value={formatDate(userProfile.dob)} />
							<ProfileField label="Age" value={userProfile.age ?? "-"} />
							<ProfileField label="Gender" value={userProfile.gender ?? "-"} />
							<ProfileField label="Sexual Orientation" value={userProfile.sexual_orientation ?? "-"} />
							<ProfileField label="Marital Status" value={userProfile.marital_status ?? "-"} />
							<ProfileField label="Occupation" value={userProfile.occupation ?? "-"} />
						</div>
					)}

					{role !== "user" && counselorProfile && !isEditing && (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div className="space-y-2">
								<p className="text-xs uppercase tracking-wide text-gray-500">Avatar</p>
								<AvatarDisplay avatar={counselorProfile.avatar} />
							</div>
							<ProfileField label="Age" value={counselorProfile.age ?? "-"} />
							<ProfileField label="Gender" value={counselorProfile.gender ?? "-"} />
							<ProfileField label="Licence Number" value={counselorProfile.licence_number ?? "-"} />
							<ProfileField label="Years of Experience" value={counselorProfile.years_of_experience ?? "-"} />
							<div className="space-y-2 rounded-lg border border-gray-100 bg-white p-3 sm:col-span-2 lg:col-span-3">
								<p className="text-xs uppercase tracking-wide text-gray-500">Specializations</p>
								<SpecializationGrid value={counselorProfile.specializations} options={SPECIALIZATIONS} onChange={() => {}} viewMode />
							</div>
						</div>
					)}

					{role === "user" && isEditing && userForm && (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div className="sm:col-span-2 lg:col-span-3">
								<AvatarUploadField
									avatar={userForm.avatar}
									onAvatarChange={(base64) =>
										setUserForm((prev) => (prev ? { ...prev, avatar: base64 } : prev))
									}
									disabled={saving}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
								<Input
									value={userForm.gender}
									onChange={(e) => setUserForm((prev) => (prev ? { ...prev, gender: e.target.value } : prev))}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Date of Birth</p>
								<Input
									type="date"
									value={userForm.dob}
									onChange={(e) => setUserForm((prev) => (prev ? { ...prev, dob: e.target.value } : prev))}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Age</p>
								<Input value={computeAgeFromDob(userForm.dob)} disabled />
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Sexual Orientation</p>
								<Input
									value={userForm.sexualOrientation}
									onChange={(e) =>
										setUserForm((prev) => (prev ? { ...prev, sexualOrientation: e.target.value } : prev))
									}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Marital Status</p>
								<Input
									value={userForm.maritalStatus}
									onChange={(e) => setUserForm((prev) => (prev ? { ...prev, maritalStatus: e.target.value } : prev))}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Occupation</p>
								<Input
									value={userForm.occupation}
									onChange={(e) => setUserForm((prev) => (prev ? { ...prev, occupation: e.target.value } : prev))}
								/>
							</div>
						</div>
					)}

					{role !== "user" && isEditing && counselorForm && (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div className="sm:col-span-2 lg:col-span-3">
								<AvatarUploadField
									avatar={counselorForm.avatar}
									onAvatarChange={(base64) =>
										setCounselorForm((prev) => (prev ? { ...prev, avatar: base64 } : prev))
									}
									disabled={saving}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Full Name</p>
								<Input
									value={counselorForm.fullName}
									onChange={(e) =>
										setCounselorForm((prev) => (prev ? { ...prev, fullName: e.target.value } : prev))
									}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
								<Input
									value={counselorForm.gender}
									onChange={(e) => setCounselorForm((prev) => (prev ? { ...prev, gender: e.target.value } : prev))}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Date of Birth</p>
								<Input
									type="date"
									value={counselorForm.dob}
									onChange={(e) => setCounselorForm((prev) => (prev ? { ...prev, dob: e.target.value } : prev))}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Age</p>
								<Input value={computeAgeFromDob(counselorForm.dob)} disabled />
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Licence Number</p>
								<Input
									value={counselorForm.licenceNumber}
									onChange={(e) =>
										setCounselorForm((prev) => (prev ? { ...prev, licenceNumber: e.target.value } : prev))
									}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-wide text-gray-500">Years of Experience</p>
								<Input
									type="number"
									min={0}
									value={counselorForm.yearsOfExperience}
									onChange={(e) =>
										setCounselorForm((prev) => (prev ? { ...prev, yearsOfExperience: e.target.value } : prev))
									}
								/>
							</div>
							<div className="space-y-1 sm:col-span-2 lg:col-span-3">
								<p className="text-xs uppercase tracking-wide text-gray-500">Specializations</p>
								<SpecializationGrid value={counselorForm.specializations} options={SPECIALIZATIONS} onChange={(val) => setCounselorForm((prev) => (prev ? { ...prev, specializations: val } : prev))} />
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
