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
  <div className="space-y-3">
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 rounded-md">
        {error}
      </div>
    )}

    {loading && (
      <div className="flex justify-center items-center py-10">
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    )}

    {!loading && doctors.length === 0 && (
      <div className="flex justify-center items-center py-10">
        <p className="text-muted-foreground">No doctors available</p>
      </div>
    )}

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            className="rounded-xl shadow-sm hover:shadow-md transition-shadow py-0"
          >
            <CardContent className="p-5 flex flex-col gap-4 h-full">
              
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      doctor.avatar
                        ? `data:image/png;base64,${doctor.avatar}`
                        : undefined
                    }
                    alt={doctor.full_name}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold truncate">
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
              <div className="text-sm space-y-1 text-muted-foreground">
                {doctor.years_of_experience && (
                  <p>
                    <span className="font-medium text-foreground">
                      Experience:
                    </span>{" "}
                    {doctor.years_of_experience} years
                  </p>
                )}

                {doctor.location && (
                  <p>
                    <span className="font-medium text-foreground">
                      Location:
                    </span>{" "}
                    {doctor.location}
                  </p>
                )}

                {doctor.hospital && (
                  <p>
                    <span className="font-medium text-foreground">
                      Hospital:
                    </span>{" "}
                    {doctor.hospital}
                  </p>
                )}
              </div>

              {/* Badge */}
              <div>
                <Badge className="bg-green-500 text-white">Available</Badge>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/counselors/${doctor.userid}/view`)
                  }
                >
                  View
                </Button>

                <Button
                  className="flex-1"
                  onClick={() =>
                    router.push(`/counselors/${doctor.userid}/book`)
                  }
                >
                  Book
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  </div>
)
}