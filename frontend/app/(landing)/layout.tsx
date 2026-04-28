import React from 'react';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}