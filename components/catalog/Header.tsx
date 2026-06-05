import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-brand-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
          🌿
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Fit Natural</h1>
          <p className="text-brand-200 text-xs">Alimentos naturales y saludables</p>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.002 0C5.373 0 .001 5.373.001 12c0 2.117.554 4.104 1.523 5.827L0 24l6.335-1.524A11.955 11.955 0 0012.002 24c6.628 0 12-5.373 12-12s-5.372-12-11.998-12zm0 21.818a9.809 9.809 0 01-4.996-1.368l-.357-.213-3.722.896.924-3.634-.232-.373A9.796 9.796 0 012.183 12c0-5.417 4.402-9.818 9.819-9.818 5.416 0 9.818 4.401 9.818 9.818 0 5.416-4.402 9.818-9.818 9.818z"/>
          </svg>
          <span className="hidden sm:inline">Escribir</span>
        </a>
      </div>
    </header>
  )
}
