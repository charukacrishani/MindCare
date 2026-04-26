'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"
import { useRouter } from "next/navigation"
import { SpecializationGrid } from "../components/SpecializationGrid"
import { SPECIALIZATIONS } from "../components/ProfileSetupForm"
import { Loader } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

type Doctor = {
  userid: string
  full_name: string
  specializations?: string
  age?: number
  years_of_experience?: number
  hospital?: string
  location?: string
  avatar?: string | null
  license_no?: string
  licence_number?: string
}

export default function CounselorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<Doctor[]>("/doctor/list")
      setDoctors(response.data || [])
      setError(null)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setError("Failed to load doctors list")
    } finally {
      setLoading(false)
    }
  }


return (
  <div className="w-full p-4 md:p-6">
    {/* Page header */}
    <PageHeader title="Counselors" shortTitle="Find a Counselor" description="Browse through our list of qualified counselors and book an appointment that suits you." />

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
        {error}
      </div>
    )}

    {loading && (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
        <p className="text-sm text-gray-500">Loading counselors...</p>
      </div>
    )}

    {!loading && doctors.length === 0 && (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-gray-500">No counselors available at the moment.</p>
        <p className="text-sm text-gray-400">Check back soon.</p>
      </div>
    )}

    {!loading && doctors.length > 0 && (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => {
          const initials =
            doctor.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "DR"

          return (
            <Card
              key={doctor.userid}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow py-0 border-gray-100"
            >
              <CardContent className="p-5 flex flex-col gap-4 h-full">

                {/* Header */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={doctor.avatar ? `data:image/png;base64,${doctor.avatar}` : undefined}
                      alt={doctor.full_name}
                    />
                    <AvatarFallback className="bg-purple-100 text-[#980194] font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {doctor.full_name}
                    </h3>
                    <div className="mt-1">
                      <SpecializationGrid
                        value={doctor.specializations}
                        options={SPECIALIZATIONS}
                        onChange={() => {}}
                        viewMode
                      />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="text-sm space-y-1 text-gray-500">
                  {doctor.years_of_experience && (
                    <p>
                      <span className="font-medium text-gray-700">Experience:</span>{" "}
                      {doctor.years_of_experience} years
                    </p>
                  )}
                  {doctor.location && (
                    <p>
                      <span className="font-medium text-gray-700">Location:</span>{" "}
                      {doctor.location}
                    </p>
                  )}
                  {doctor.hospital && (
                    <p>
                      <span className="font-medium text-gray-700">Hospital:</span>{" "}
                      {doctor.hospital}
                    </p>
                  )}
                </div>

                {/* Badge */}
                <div>
                  <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium">
                    Available
                  </Badge>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-200 text-gray-700 hover:border-[#980194] hover:text-[#980194]"
                    onClick={() => router.push(`/counselors/${doctor.userid}/view`)}
                  >
                    View
                  </Button>
                  <Button
                    className="flex-1 bg-[#980194] hover:bg-[#7a0177] text-white"
                    onClick={() => router.push(`/counselors/${doctor.userid}/book`)}
                  >
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )}
  </div>
)
}