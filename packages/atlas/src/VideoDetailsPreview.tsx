import { FC, useState } from 'react'

import { SvgActionChevronB, SvgActionChevronT } from '@/assets/icons'
import { Text } from '@/components/Text'
import { DisplayCategory } from '@/config/categories'
import { useMediaMatch } from '@/hooks/useMediaMatch'

import {
  DescriptionBody,
  DescriptionContainer,
  DescriptionCopyWrapper,
  DetailsWrapper,
  ExpandButton,
} from './views/viewer/VideoView/VideoDetails.styles'

type VideoDetailsPreviewProps = {
  description?: string
  categoryData?: DisplayCategory[] | null
}
export const VideoDetailsPreview: FC<VideoDetailsPreviewProps> = ({ description, categoryData }) => {
  const mdMatch = useMediaMatch('md')
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  const toggleDetailsExpand = () => {
    setDetailsExpanded((prevState) => !prevState)
  }

  return (
    <DetailsWrapper>
      <DescriptionContainer>
        {description && (
          <>
            <Text as="h2" variant="h100" margin={{ bottom: 2 }}>
              Description
            </Text>
            <DescriptionBody detailsExpanded={detailsExpanded}>
              <DescriptionCopyWrapper as="div" variant={mdMatch ? 't300' : 't200'}>
                {description}
              </DescriptionCopyWrapper>
            </DescriptionBody>
          </>
        )}
      </DescriptionContainer>
      {description && (
        <ExpandButton
          onClick={toggleDetailsExpand}
          iconPlacement="right"
          size="medium"
          variant="tertiary"
          icon={detailsExpanded ? <SvgActionChevronT /> : <SvgActionChevronB />}
        >
          Show {!detailsExpanded ? 'more' : 'less'}
        </ExpandButton>
      )}
    </DetailsWrapper>
  )
}
