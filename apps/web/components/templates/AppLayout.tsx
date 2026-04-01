import Sidebar from '@/components/organisms/Sidebar'

interface Props {
  children: React.ReactNode
  header?: React.ReactNode
}

export default function AppLayout({ children, header }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Fixed header */}
      <header className="fixed top-0 right-0 left-56 h-14 z-40 bg-white flex items-center justify-between px-6 border-b border-gray-100">
        {header ?? <div />}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">DS</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pl-56 pt-14 min-h-screen bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
