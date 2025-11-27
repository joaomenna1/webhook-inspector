import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { SideBar } from '../components/sidebar'

const queryClient = new QueryClient()

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <div className="h-screen bg-zinc-900">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <SideBar />
        </Panel>

        <PanelResizeHandle className="w-px bg-zinc-700 hover:bg-zinc-500 transition-colors duration-150" />

        <Panel defaultSize={80} minSize={60}>
          <Outlet />
        </Panel>
      </PanelGroup>
    </div>
  </QueryClientProvider>
)

export const Route = createRootRoute({ component: RootLayout })
