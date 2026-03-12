"use client"
import { useUser } from "./layout";

export default function Dashboard() {
  const user = useUser();

  if (!user) {
    return <p>Loading user information...</p>;
  }

  return (
    <>
    {user.role == "user" ? (<div>Welcome User, {user.first_name}!</div>) : (<div>Welcome Doctor, {user.first_name}!</div>)}
    </>
  );
}