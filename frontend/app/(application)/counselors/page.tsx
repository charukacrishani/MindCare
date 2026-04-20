'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/apiClient"

type Doctor = {
  userid: string
  full_name: string
  specialization?: string
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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">No doctors available</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => {
          const specialty = doctor.specialization || doctor.specializations || "Medical Professional"
          const initials = doctor.full_name
            ?.split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase() || "DR"

          return (
            <Card key={doctor.userid} className="p-4">
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={doctor.avatar || undefined} alt={doctor.full_name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                      {doctor.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {specialty}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {doctor.years_of_experience && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Experience:</span> {doctor.years_of_experience} years
                    </p>
                  )}
                  {doctor.location && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Location:</span> {doctor.location}
                    </p>
                  )}
                  {doctor.hospital && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Hospital:</span> {doctor.hospital}
                    </p>
                  )}
                </div>

                <Badge className="w-fit bg-green-500">Available</Badge>

                <Button className="w-full">
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}