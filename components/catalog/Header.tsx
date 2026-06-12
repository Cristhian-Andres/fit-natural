export default function Header() {
  return (
    <header className="bg-brand-700 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
          🌿
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Fit Natural</h1>
          <p className="text-brand-200 text-xs">Alimentos naturales y saludables</p>
        </div>

        {/* Botones a la derecha */}
        <div className="ml-auto flex items-center gap-2">

          {/* Instagram */}
          <a
            href="https://www.instagram.com/fitnatural_pop/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Fit Natural"
            className="flex items-center gap-1.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-sm font-medium px-3 py-2 rounded-full transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Fit Natural"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-sm font-medium px-3 py-2 rounded-full transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.002 0C5.373 0 .001 5.373.001 12c0 2.117.554 4.104 1.523 5.827L0 24l6.335-1.524A11.955 11.955 0 0012.002 24c6.628 0 12-5.373 12-12s-5.372-12-11.998-12zm0 21.818a9.809 9.809 0 01-4.996-1.368l-.357-.213-3.722.896.924-3.634-.232-.373A9.796 9.796 0 012.183 12c0-5.417 4.402-9.818 9.819-9.818 5.416 0 9.818 4.401 9.818 9.818 0 5.416-4.402 9.818-9.818 9.818z"/>
            </svg>
            <span className="hidden sm:inline">Escribir</span>
          </a>

        </div>
      </div>
    </header>
  )
}
