import { PublicAmbientController } from "@/components/layout/public-ambient-controller"
import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <PublicAmbientController />
      <PublicHeader />
      <div className="relative z-10">
        {children}
        <PublicFooter />
      </div>
    </>
  )
}
