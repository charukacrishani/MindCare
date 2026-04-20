"use client"
import DoctorDashboard from "./components/Dashboard/DoctorDashboard";
import UserDashboard from "./components/Dashboard/UserDashboard";
import { useUser } from "./layout";

export default function Dashboard() {
  const user = useUser();

  if (!user) {
    return <p>Loading user information...</p>;
  }

  return (
    <>
    {user.role == "user" ? (<UserDashboard />) : (<DoctorDashboard />)}
    </>
  );
}