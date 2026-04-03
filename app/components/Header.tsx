export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight">SecureScope</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-gray-400 font-medium">
                Cyber Intelligence Dashboard
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <a
              href="#"
              className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
              aria-current="page"
            >
              Dashboard
            </a>
            <a
              href="#history"
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              History
            </a>
            <span className="ml-2 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Mock Data
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
