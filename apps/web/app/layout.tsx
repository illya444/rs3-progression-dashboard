import "../styles/globals.css"
import React from "react"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </body>
    </html>
  )
}
