import { Nav } from './_components/nav'
import { ScrollArea, ScrollBar } from '@ui/ui/scroll-area'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b">
        <ScrollArea>
          <Nav />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </header>

      <ScrollArea className="flex-1">{children}</ScrollArea>
    </div>
  )
}