import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Iglecrecimiento - Sistema de Control de Abonos",
  description: "Sistema de gestión de abonos para el evento de iglesia Iglecrecimiento",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={poppins.variable}
    >
      <body className="min-h-screen flex flex-col bg-gray-50 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}