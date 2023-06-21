import styled from '@emotion/styled'
import { FC, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { BottomNav } from '@/components/_navigation/BottomNav'
import { SidenavViewer } from '@/components/_navigation/SidenavViewer'
import { TopbarViewer } from '@/components/_navigation/TopbarViewer'
import { atlasConfig } from '@/config'
import { absoluteRoutes, relativeRoutes } from '@/config/routes'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { useSearchStore } from '@/providers/search'
import { useUser } from '@/providers/user/user.hooks'
import { RoutingState } from '@/types/routing'
import { YppLandingView } from '@/views/global/YppLandingView'

import { CategoryView } from './CategoryView'
import { ChannelView } from './ChannelView'
import { ChannelsView } from './ChannelsView'
import { DiscoverView } from './DiscoverView'
import { HomeView } from './HomeView'
import { MarketplaceView } from './MarketplaceView'
import { MemberView } from './MemberView'
import { SearchView } from './SearchView'
import { VideoView } from './VideoView'

const viewerRoutes = [
  { path: relativeRoutes.viewer.search(), element: <SearchView /> },
  { path: relativeRoutes.viewer.index(), element: <HomeView /> },
  { path: relativeRoutes.viewer.discover(), element: <DiscoverView /> },
  { path: relativeRoutes.viewer.video(), element: <VideoView /> },
  { path: relativeRoutes.viewer.channels(), element: <ChannelsView /> },
  { path: relativeRoutes.viewer.channel(), element: <ChannelView /> },
  { path: relativeRoutes.viewer.category(), element: <CategoryView /> },
  { path: relativeRoutes.viewer.member(), element: <MemberView /> },
  { path: relativeRoutes.viewer.marketplace(), element: <MarketplaceView /> },
  ...(atlasConfig.features.ypp.googleConsoleClientId
    ? [{ path: relativeRoutes.viewer.ypp(), element: <YppLandingView /> }]
    : []),
]

const ENTRY_POINT_ROUTE = absoluteRoutes.viewer.index()

export const ViewerLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const locationState = location.state as RoutingState
  const { isLoggedIn } = useUser()

  const navigate = useNavigate()
  const mdMatch = useMediaMatch('md')
  const searchOpen = useSearchStore((state) => state.searchOpen)
  const displayedLocation = locationState?.overlaidLocation || location

  return (
    <div style={{ pointerEvents: 'none' }}>
      <TopbarViewer />
      <SidenavViewer />
      <MainContainer>{children}</MainContainer>
      {!mdMatch && !searchOpen && <BottomNav />}
    </div>
  )
}

const MainContainer = styled.main`
  position: relative;
  padding: var(--size-topbar-height) var(--size-global-horizontal-padding) 0;
  margin-left: var(--size-sidenav-width-collapsed);
  height: 100%;
`
