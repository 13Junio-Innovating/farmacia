export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary">⌀</span>
          </div>
          <div>
            <div className="font-semibold">PharmaFlow</div>
            <div className="text-sm text-gray-500">Gestão de Pedidos</div>
          </div>
        </div>
      </div>
    </header>
  )
}
