import { useEffect, useState } from 'react'
import { Innertube } from 'youtubei.js'
import { VideoInfo } from 'youtubei.js/dist/src/parser/youtube'

import { CommonProviders } from '@/CommonProviders'
import { PreviewVideoView } from '@/VideoPreview'
import { ColumnBox, RowBox } from '@/components/TablePaymentsHistory/TablePaymentsHistory.styles'
import { Text } from '@/components/Text'
import { Button } from '@/components/_buttons/Button'
import { Input } from '@/components/_inputs/Input'
import { VerticallyCenteredDiv } from '@/components/_overlays/SendTransferDialogs/SendTransferDialogs.styles'
import { JoystreamProvider } from '@/providers/joystream/joystream.provider'
import { ViewerLayout } from '@/views/viewer/ViewerLayout'

export const App = () => {
  const [innertube, setInnertube] = useState<Innertube | null>(null)
  const [metadata, setMetadata] = useState<VideoInfo | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const handleVid = async () => {
    if (!innertube) {
      return
    }

    try {
      const endpoint = await innertube.resolveURL(inputValue)
      const videoInfo = await innertube.getInfo(endpoint)
      setError('')
      setMetadata(videoInfo)
    } catch (e) {
      setError(e.toString())
    }
  }

  useEffect(() => {
    const initInnertube = async () => {
      const yt = await Innertube.create({
        generate_session_locally: true,
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
          // url
          const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url)

          // transform the url for use with our proxy
          url.searchParams.set('__host', url.host)
          url.host = 'localhost:4500'
          // url.pathname = '/proxy-preview' + url.pathname
          url.protocol = 'http'

          const headers = init?.headers
            ? new Headers(init.headers)
            : input instanceof Request
            ? input.headers
            : new Headers()

          // now serialize the headers
          url.searchParams.set('__headers', JSON.stringify([...headers]))

          // @ts-ignore because
          input.duplex = 'half'

          // copy over the request
          const request = new Request(url, input instanceof Request ? input : undefined)

          headers.delete('user-agent')

          // fetch the url
          return fetch(
            request,
            init
              ? {
                  ...init,
                  headers,
                }
              : {
                  headers,
                }
          )
        },
        retrieve_player: false,
      })
      setInnertube(yt)
    }
    initInnertube()
  }, [])

  return (
    <JoystreamProvider>
      <CommonProviders>
        <ViewerLayout>
          {!metadata && (
            <VerticallyCenteredDiv
              style={{ height: '10%', justifyContent: 'center', marginTop: '24px', pointerEvents: 'all' }}
            >
              <RowBox>
                <Text variant="h400" as="h2">
                  Enter video id in the input below
                </Text>
                {error && (
                  <Text variant="h200" as="h3" color="colorTextError">
                    {error}
                  </Text>
                )}
                <ColumnBox>
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                  <Button onClick={() => handleVid()}>Preview</Button>
                </ColumnBox>
              </RowBox>
            </VerticallyCenteredDiv>
          )}
          <div>
            {metadata && (
              <div
                style={{ width: '100%', height: '100%', cursor: 'pointer', pointerEvents: 'all', zIndex: 1234567 }}
                onClick={() => {
                  setInputValue('')
                  setMetadata(null)
                }}
              >
                <PreviewVideoView
                  thumbnailUrl={metadata.basic_info.thumbnail?.[0].url}
                  avatarUrl={metadata.secondary_info?.owner?.author.thumbnails[0].url}
                  dateUploaded={metadata.primary_info?.published.text}
                  title={metadata.basic_info.title}
                  numberOfViews={metadata.basic_info.view_count}
                  channelFollowers={metadata.secondary_info?.owner?.subscriber_count.text}
                  channelName={metadata.basic_info.channel?.name}
                  numberOfLikes={metadata.basic_info.like_count}
                  videoDescription={metadata.basic_info.short_description}
                />
              </div>
            )}
          </div>
        </ViewerLayout>
      </CommonProviders>
    </JoystreamProvider>
  )
}
