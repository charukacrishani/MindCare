import { Button } from "@/components/ui/button";

export default function BookAppointmentPage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>
            <p className="text-muted-foreground mb-8">This is the book appointment page for the counselor.</p>
            <Button>Book Now</Button>
        </div>
    )
}