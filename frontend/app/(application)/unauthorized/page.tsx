export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-3xl font-bold text-red-500">403</h1>
      <p className="text-gray-600">You don’t have access to this page.</p>
    </div>
  );
}