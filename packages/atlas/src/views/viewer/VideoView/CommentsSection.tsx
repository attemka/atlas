import { debounce } from 'lodash-es'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useComment, useUserCommentsReactions } from '@/api/hooks/comments'
import { CommentOrderByInput } from '@/api/queries/__generated__/baseTypes.generated'
import { FullVideoFieldsFragment } from '@/api/queries/__generated__/fragments.generated'
import { EmptyFallback } from '@/components/EmptyFallback'
import { Text } from '@/components/Text'
import { LoadMoreButton } from '@/components/_buttons/LoadMoreButton'
import { Comment } from '@/components/_comments/Comment'
import { CommentInput } from '@/components/_comments/CommentInput'
import { Select } from '@/components/_inputs/Select'
import { QUERY_PARAMS } from '@/config/routes'
import { COMMENTS_SORT_OPTIONS } from '@/config/sorting'
import { useDisplaySignInDialog } from '@/hooks/useDisplaySignInDialog'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { useReactionTransactions } from '@/hooks/useReactionTransactions'
import { useRouterQuery } from '@/hooks/useRouterQuery'
import { getMemberAvatar } from '@/providers/assets/assets.helpers'
import { useFee } from '@/providers/joystream/joystream.hooks'
import { useUser } from '@/providers/user/user.hooks'
import { createPlaceholderData } from '@/utils/data'

import { CommentThread } from './CommentThread'
import {
  CommentWrapper,
  CommentsSectionHeader,
  CommentsSectionWrapper,
  LoadMoreCommentsWrapper,
} from './VideoView.styles'

type CommentsSectionProps = {
  disabled?: boolean
  comments?: any[]
  video?: FullVideoFieldsFragment | null
  videoLoading: boolean
  videoAuthorId?: string
  onCommentInputFocus?: (arg: boolean) => void
}

const SCROLL_TO_COMMENT_TIMEOUT = 300
const INITIAL_COMMENTS = 10

export const CommentsSection: FC<CommentsSectionProps> = ({
  disabled,
  video,
  videoLoading,
  onCommentInputFocus,
  comments,
}) => {
  const [commentInputText, setCommentInputText] = useState('')
  const [commentInputIsProcessing, setCommentInputIsProcessing] = useState(false)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [sortCommentsBy, setSortCommentsBy] = useState(COMMENTS_SORT_OPTIONS[0].value)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentInputActive, setCommentInputActive] = useState(false)
  const commentIdQueryParam = useRouterQuery(QUERY_PARAMS.COMMENT_ID)
  const mdMatch = useMediaMatch('md')
  const { id: videoId } = useParams()
  const { memberId, signIn, activeMembership, isLoggedIn } = useUser()
  const { openSignInDialog } = useDisplaySignInDialog({ interaction: true })
  const { isLoadingAsset: isMemberAvatarLoading, url: memberAvatarUrl } = getMemberAvatar(activeMembership)

  const { fullFee: fee, loading: feeLoading } = useFee(
    'createVideoCommentTx',
    memberId && video?.id && commentInputActive ? [memberId, video?.id, commentInputText || '', null] : undefined
  )

  const queryVariables = useMemo(
    () => ({
      memberId,
      videoId,
      orderBy: sortCommentsBy,
    }),
    [memberId, sortCommentsBy, videoId]
  )
  const commentsSectionHeaderRef = useRef<HTMLDivElement>(null)
  const commentSectionWrapperRef = useRef<HTMLDivElement>(null)
  const mobileCommentsOpen = commentsOpen || mdMatch
  const [numberOfComments, setNumberOfComments] = useState(mobileCommentsOpen ? INITIAL_COMMENTS : 1)
  // const { comments, loading, fetchMore, pageInfo, networkStatus } = useCommentSectionComments(
  //   { ...queryVariables, first: mobileCommentsOpen ? INITIAL_COMMENTS : 1 },
  //   { skip: disabled || !videoId, notifyOnNetworkStatusChange: true }
  // )
  const { userReactions } = useUserCommentsReactions(videoId, memberId)

  const { addComment } = useReactionTransactions()

  const { comment: commentFromUrl, loading: commentFromUrlLoading } = useComment(
    { commentId: commentIdQueryParam || '' },
    {
      skip: !commentIdQueryParam,
    }
  )
  const { comment: parentCommentFromUrl, loading: parentCommentFromUrlLoading } = useComment(
    { commentId: commentFromUrl?.parentComment?.id || '' },
    {
      skip: !commentFromUrl || !commentFromUrl.parentComment?.id,
    }
  )

  const commentsLoading = false
  const isFetchingMore = false

  const scrollToCommentInput = (smooth?: boolean) => {
    commentsSectionHeaderRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }

  const handleSorting = (value?: CommentOrderByInput[] | null) => {
    if (value) {
      setSortCommentsBy(value)
    }
  }

  const setMoreComments = () => setNumberOfComments((prevState) => prevState + INITIAL_COMMENTS)

  // increase number of comments when user scrolls to the end of page
  useEffect(() => {
    if (!mobileCommentsOpen) {
      return
    }
    const scrollHandler = debounce(() => {
      if (!commentSectionWrapperRef.current) return
      const scrolledToBottom = document.documentElement.scrollTop >= commentSectionWrapperRef.current.scrollHeight
    }, 100)
    window.addEventListener('scroll', scrollHandler)

    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [commentsLoading, mobileCommentsOpen])

  const handleComment = async (parentCommentId?: string) => {
    if (!videoId || !commentInputText) {
      return
    }
    setCommentInputIsProcessing(true)
    const newCommentId = await addComment({
      videoId,
      commentBody: commentInputText,
      parentCommentId,
      videoTitle: video?.title,
    })
    setCommentInputIsProcessing(false)
    if (newCommentId) {
      setCommentInputText('')
      setHighlightedCommentId(newCommentId || null)
    }
  }

  const handleLoadMoreClick = () => {
    if (!comments || !comments.length) {
      return
    }
    setCommentsOpen(true)
    setMoreComments()
  }

  const placeholderItems = commentsLoading ? createPlaceholderData(4) : []

  useEffect(() => {
    if (!commentIdQueryParam || !commentSectionWrapperRef.current) {
      return
    }
    const scrollTimeout = setTimeout(() => {
      scrollToCommentInput(true)
      setHighlightedCommentId(commentIdQueryParam)
    }, SCROLL_TO_COMMENT_TIMEOUT)

    return () => {
      clearTimeout(scrollTimeout)
    }
  }, [commentIdQueryParam])

  useEffect(
    function resetHighlightedComment() {
      if (!highlightedCommentId || commentsLoading) {
        return
      }
      const timeout = setTimeout(() => {
        setHighlightedCommentId(null)
      }, 3000)

      return () => clearTimeout(timeout)
    },
    [commentsLoading, highlightedCommentId, setHighlightedCommentId]
  )

  const displayedCommentFromUrl = commentFromUrl?.parentComment?.id ? parentCommentFromUrl : commentFromUrl

  // remove comment taken from url from regular array of comments
  const filteredComments = comments?.filter((comment) => comment.id !== displayedCommentFromUrl?.id) || []

  const mappedPlaceholders = placeholderItems.map((_, idx) => <Comment key={idx} />)

  if (disabled) {
    return (
      <CommentsSectionWrapper>
        <EmptyFallback title="Comments are disabled" subtitle="Author has disabled comments for this video" />
      </CommentsSectionWrapper>
    )
  }
  return (
    <CommentsSectionWrapper>
      <CommentsSectionHeader ref={commentsSectionHeaderRef}>
        <Text as="p" variant="h400">
          3 comments
        </Text>
        <Select
          size="medium"
          inlineLabel={mdMatch ? 'Sort by' : ''}
          value={sortCommentsBy}
          items={COMMENTS_SORT_OPTIONS}
          onChange={handleSorting}
          disabled={false}
        />
      </CommentsSectionHeader>
      <CommentInput
        memberAvatarUrl={memberAvatarUrl}
        isMemberAvatarLoading={isLoggedIn ? isMemberAvatarLoading : false}
        processing={commentInputIsProcessing}
        readOnly={!memberId}
        memberHandle={activeMembership?.handle}
        value={commentInputText}
        fee={fee}
        feeLoading={feeLoading}
        hasInitialValueChanged={!!commentInputText}
        onFocus={() => !memberId && openSignInDialog({ onConfirm: signIn })}
        onComment={() => handleComment()}
        onChange={(e) => setCommentInputText(e.target.value)}
        onCommentInputActive={(value) => {
          onCommentInputFocus?.(value)
          setCommentInputActive(value)
        }}
      />
      {comments && !comments.length && !commentsLoading && (
        <EmptyFallback title="Be the first to comment" subtitle="Nobody has left a comment under this video yet." />
      )}
      <CommentWrapper ref={commentSectionWrapperRef}>
        {commentsLoading && !isFetchingMore
          ? mappedPlaceholders
          : comments
              ?.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  video={video}
                  hasAnyReplies={comment.repliesCount > 0}
                  repliesCount={comment.repliesCount}
                  userReactionsLookup={userReactions}
                  highlightedCommentId={highlightedCommentId}
                  setHighlightedCommentId={setHighlightedCommentId}
                />
              ))
              .concat(isFetchingMore && commentsLoading ? mappedPlaceholders : [])}
      </CommentWrapper>
      {!mobileCommentsOpen && !commentsLoading && comments && !!comments.length && (
        <LoadMoreCommentsWrapper>
          <LoadMoreButton label="Show more comments" onClick={handleLoadMoreClick} />
        </LoadMoreCommentsWrapper>
      )}
    </CommentsSectionWrapper>
  )
}
