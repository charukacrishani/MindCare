import { Button } from "@/components/ui/button";

export default function ViewCounselorPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">View Counselor</h1>
            <p className="text-muted-foreground mb-8">This is the view counselor page.</p>
            <Button>Book Appointment</Button>
        </div>
    )
}