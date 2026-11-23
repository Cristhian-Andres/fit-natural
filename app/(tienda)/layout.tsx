import StoreExperience from '@/components/catalog/StoreExperience'

// Layout compartido de la tienda publica: persiste al navegar entre el
// catalogo y las fichas, asi el loader inicial y el contador del modal
// no se reinician en cada pagina.
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Antes del primer pintado: si el loader ya se vio en esta sesion,
          lo oculta con CSS para que no parpadee al recargar. */}
      <script
        dangerouslySetInnerHTML={{
          __html: "try{if(sessionStorage.getItem('fn_intro_seen')==='1')document.documentElement.classList.add('fn-intro-seen')}catch(e){}",
        }}
      />
      {/* Antes del contenido: el loader debe pintarse primero */}
      <StoreExperience />
      {children}
    </>
  )
}
