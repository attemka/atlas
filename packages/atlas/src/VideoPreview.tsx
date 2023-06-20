import BN from 'bn.js'
import { FC, useState } from 'react'
import { useParams } from 'react-router-dom'

import { VideoDetailsPreview } from '@/VideoDetailsPreview'
import {
  BasicChannelFieldsFragment,
  BasicMembershipFieldsFragment,
} from '@/api/queries/__generated__/fragments.generated'
import { SvgActionFlag, SvgActionMore, SvgActionShare } from '@/assets/icons'
import { GridItem } from '@/components/LayoutGrid'
import { LimitedWidthContainer } from '@/components/LimitedWidthContainer'
import { NumberFormat } from '@/components/NumberFormat'
import { Button } from '@/components/_buttons/Button'
import { ChannelLink } from '@/components/_channel/ChannelLink'
import { NftWidget } from '@/components/_nft/NftWidget'
import { NftHistoryEntry } from '@/components/_nft/NftWidget/NftHistory'
import { ContextMenu } from '@/components/_overlays/ContextMenu'
import { displayCategories } from '@/config/categories'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { usePersonalDataStore } from '@/providers/personalData'
import { transitions } from '@/styles'
import { formatDate } from '@/utils/time'
import { CommentsSection } from '@/views/viewer/VideoView/CommentsSection'
import { MoreVideos } from '@/views/viewer/VideoView/MoreVideos'
import {
  ButtonsContainer,
  ChannelContainer,
  Meta,
  PlayerContainer,
  PlayerGridItem,
  PlayerGridWrapper,
  PlayerWrapper,
  StyledReactionStepper,
  TitleContainer,
  TitleText,
  VideoUtils,
} from '@/views/viewer/VideoView/VideoView.styles'

interface PreviewVideoViewProps {
  thumbnailUrl?: string
  avatarUrl?: string
  dateUploaded?: string
  title?: string
  numberOfViews?: number
  channelFollowers?: string
  channelName?: string
  numberOfLikes?: number
  videoDescription?: string
}

export const PreviewVideoView: FC<PreviewVideoViewProps> = ({
  thumbnailUrl,
  numberOfLikes,
  channelName,
  avatarUrl,
  videoDescription,
  numberOfViews,
  dateUploaded,
  channelFollowers,
  title,
}) => {
  const { id } = useParams()
  const [reactionFee, setReactionFee] = useState<BN | undefined>()
  const reactionPopoverDismissed = usePersonalDataStore((state) => state.reactionPopoverDismissed)

  const abbrToNum = (abbr: string) => {
    const multiplier = abbr.slice(-1)
    const outputNum = Number(abbr.slice(0, abbr.length - 1))
    const multiplierSpec = {
      'k': 1e3,
      'M': 1e6,
      'B': 1e9,
    } as { [key: string]: number }
    if (['k', 'M', 'B'].includes(multiplier)) {
      return outputNum * multiplierSpec[multiplier]
    } else return Number(abbr)
  }

  const channelMock: BasicChannelFieldsFragment = {
    __typename: 'Channel',
    id: '',
    title: channelName,
    description: '',
    createdAt: new Date(),
    followsNum: (channelFollowers && abbrToNum(channelFollowers.split(' ')[0])) || 0,
    rewardAccount: '',
    channelStateBloatBond: '',
    avatarPhoto: {
      __typename: 'StorageDataObject',
      id: '',
      resolvedUrls: [avatarUrl || ''],
      resolvedUrl: avatarUrl,
      createdAt: new Date(),
      size: '',
      isAccepted: true,
      ipfsHash: '',
      storageBag: { __typename: 'StorageBag', id: '0' },
      type: null,
    },
  }

  const bidUser1Mock: BasicMembershipFieldsFragment = {
    __typename: 'Membership',
    id: '1',
    handle: 'Henry',
    metadata: {
      __typename: 'MemberMetadata',
      about: '',
      avatar: {
        __typename: 'AvatarUri',
        avatarUri: 'https://atlas-services.joystream.org/avatars/ee82f463-93b3-4e00-b6db-2f34163433fe.webp',
      },
    },
  }

  const bidUser2Mock: BasicMembershipFieldsFragment = {
    __typename: 'Membership',
    id: '1',
    handle: 'JSGenesis',
    metadata: {
      __typename: 'MemberMetadata',
      about: '',
      avatar: {
        __typename: 'AvatarUri',
        avatarUri: 'https://atlas-services.joystream.org/avatars/d42844b1-6fdd-4327-9b2e-4d92748f8cc7.webp',
      },
    },
  }

  const bidUser3Mock: BasicMembershipFieldsFragment = {
    __typename: 'Membership',
    id: '1',
    handle: 'Robert',
    metadata: {
      __typename: 'MemberMetadata',
      about: '',
      avatar: { __typename: 'AvatarUri', avatarUri: 'https://sieemmanodes.com/distributor/api/v1/assets/81' },
    },
  }

  const nftHistoryMock: NftHistoryEntry[] = [
    {
      member: bidUser1Mock,
      date: new Date(1687259091167),
      joyAmount: new BN(629224000000000),
      text: 'Bid placed by',
    },
    {
      member: bidUser2Mock,
      date: new Date(1686859091167),
      joyAmount: new BN(295367000000000),
      text: 'Bid placed by',
    },
    {
      member: bidUser3Mock,
      date: new Date(1685159091167),
      joyAmount: new BN(180808000000000),
      text: 'Bid placed by',
    },
  ]

  const mdMatch = useMediaMatch('md')
  const videoCategory = null
  const belongsToCategories = videoCategory
    ? displayCategories.filter((category) => category.videoCategories.includes(videoCategory))
    : null

  const isCinematic = false
  const sideItems = (
    <GridItem colSpan={{ xxs: 12, md: 4 }}>
      <NftWidget
        ownerHandle={channelName}
        isOwner={true}
        nftHistory={nftHistoryMock}
        nftStatus={{
          status: 'buy-now',
          buyNowPrice: new BN(629224000000000),
        }}
        needsSettling={false}
        bidFromPreviousAuction={undefined}
        saleType={null}
        ownerAvatar={avatarUrl}
        onNftPutOnSale={() => {}}
        onNftCancelSale={() => {}}
        onNftAcceptBid={() => {}}
        onNftChangePrice={() => {}}
        onNftPurchase={() => {}}
        onNftSettlement={() => {}}
        onNftBuyNow={() => {}}
        onWithdrawBid={() => {}}
      />
      {/*<MoreVideos channelId={channelId} channelName={channelName} videoId={id} type="channel" />*/}
      {belongsToCategories?.map((category) => (
        <MoreVideos
          key={category.id}
          categoryId={category?.id}
          categoryName={category.name}
          videoId={id}
          type="category"
        />
      ))}
    </GridItem>
  )

  const detailsItems = (
    <>
      <TitleContainer>
        <TitleText as="h1" variant={mdMatch ? 'h500' : 'h400'}>
          {title}
        </TitleText>
        <VideoUtils>
          <Meta as="span" variant={mdMatch ? 't300' : 't100'} color="colorText">
            <>
              {formatDate(new Date(dateUploaded || ''))}
              • <NumberFormat as="span" format="full" value={numberOfViews || 0} color="colorText" /> views
            </>
          </Meta>
          <StyledReactionStepper
            reactionPopoverDismissed={true}
            onReact={(_) => new Promise<boolean>((resolve) => {})}
            fee={reactionFee}
            onCalculateFee={(_) => new Promise<void>((resolve) => {})}
            state={'default'}
            likes={numberOfLikes}
            dislikes={Number(numberOfLikes) / 15}
          />
          <ButtonsContainer>
            <Button variant="tertiary" icon={<SvgActionShare />} onClick={() => {}}>
              Share
            </Button>
            <ContextMenu
              placement="bottom-end"
              items={[
                {
                  onClick: () => {},
                  label: 'Report video',
                  nodeStart: <SvgActionFlag />,
                },
              ]}
              trigger={<Button icon={<SvgActionMore />} variant="tertiary" size="medium" />}
            />
          </ButtonsContainer>
        </VideoUtils>
      </TitleContainer>
      <ChannelContainer>
        <ChannelLink followButton id={''} overrideChannel={channelMock} textVariant="h300" avatarSize={40} />
      </ChannelContainer>
      <VideoDetailsPreview description={videoDescription} categoryData={belongsToCategories} />
    </>
  )

  return (
    <>
      <PlayerGridWrapper cinematicView={isCinematic}>
        <PlayerWrapper cinematicView={isCinematic}>
          <PlayerGridItem colSpan={{ xxs: 12, md: 8 }}>
            <PlayerContainer ref={null} className={transitions.names.slide} cinematicView={false} noVideo={true}>
              <img src={thumbnailUrl} style={{ width: '100%', height: '100%' }} />
            </PlayerContainer>
            {!isCinematic && (
              <>
                {detailsItems}
                <CommentsSection
                  video={null}
                  videoLoading={false}
                  disabled={undefined}
                  onCommentInputFocus={() => {}}
                />
              </>
            )}
          </PlayerGridItem>
          {!isCinematic && sideItems}
        </PlayerWrapper>
      </PlayerGridWrapper>
      <LimitedWidthContainer></LimitedWidthContainer>
    </>
  )
}
