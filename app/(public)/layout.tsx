export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="public min-h-full">
      {children}
    </main>
  )
}
