import StoreExperience from '@/components/catalog/StoreExperience'

// Layout compartido de la tienda publica: persiste al navegar entre el
// catalogo y las fichas, asi el loader inicial y el contador del modal
// no se reinician en cada pagina (si en cada carga o recarga).
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Antes del contenido: el loader debe pintarse primero */}
      <StoreExperience />
      {children}
    </>
  )
}
