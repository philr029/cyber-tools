export default function SecurityNotice() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-green-600"
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
          <h3 className="text-sm font-semibold text-green-800 mb-1">Your privacy is guaranteed</h3>
          <p className="text-sm text-green-700 leading-relaxed">
            All passwords and passphrases are generated <strong>entirely in your browser</strong> using the Web Crypto API.{" "}
            <strong>No data is ever sent to a server, stored in a database, or logged anywhere.</strong> Once you close this tab,
            nothing is retained unless you choose to save locally via browser storage (recent history only).
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
            {[
              "Client-side only",
              "No network requests",
              "No password storage",
              "Cryptographically secure",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
