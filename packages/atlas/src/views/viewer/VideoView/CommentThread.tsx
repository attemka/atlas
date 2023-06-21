import styled from '@emotion/styled'
import { FC, memo, useState } from 'react'

import { UserCommentReactions, useComment, useCommentRepliesConnection } from '@/api/hooks/comments'
import { SvgActionChevronB } from '@/assets/icons'
import { TextButton } from '@/components/_buttons/Button'
import { Comment, CommentProps } from '@/components/_comments/Comment'
import { sizes } from '@/styles'
import { createPlaceholderData } from '@/utils/data'

type CommentThreadProps = {
  highlightedCommentId: string | null
  linkedReplyId?: string | null
  hasAnyReplies: boolean
  userReactionsLookup: UserCommentReactions | undefined
  repliesCount: number
} & CommentProps

const INITIAL_REPLIES_COUNT = 10
const LOAD_MORE_REPLIES_COUNT = 20

const _CommentThread: FC<CommentThreadProps> = ({
  comment,
  video,
  setHighlightedCommentId,
  highlightedCommentId,
  linkedReplyId,
  hasAnyReplies,
  userReactionsLookup,
  repliesCount,
  ...commentProps
}) => {
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [newReplyId, setNewReplyId] = useState<string | null>(null)

  const { replies, totalCount, loading, fetchMore, pageInfo } = useCommentRepliesConnection({
    skip: !comment || !video?.id || !repliesOpen || !hasAnyReplies,
    variables: {
      first: INITIAL_REPLIES_COUNT,
      parentCommentId: comment || '',
    },
    notifyOnNetworkStatusChange: true,
  })

  const { comment: newReply } = useComment({ commentId: newReplyId || '' }, { skip: !newReplyId })

  const allRepliesCount = replies.length
  const repliesLeftToLoadCount = totalCount - allRepliesCount
  const allRepliesContainNewReply = !!replies.find((r) => r.id === newReplyId)

  const getPlaceholderCount = () => {
    if (repliesLeftToLoadCount) {
      if (repliesLeftToLoadCount > LOAD_MORE_REPLIES_COUNT) {
        return LOAD_MORE_REPLIES_COUNT
      }
      return repliesLeftToLoadCount
    }
    if (repliesCount > INITIAL_REPLIES_COUNT) {
      return INITIAL_REPLIES_COUNT
    }
    return repliesCount
  }

  const placeholderItems = loading ? createPlaceholderData(getPlaceholderCount()) : []

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        first: LOAD_MORE_REPLIES_COUNT,
        after: pageInfo?.endCursor,
      },
    })
  }

  return (
    <>
      <Comment
        highlighted={false}
        comment={comment}
        video={video}
        setRepliesOpen={setRepliesOpen}
        isRepliesOpen={repliesOpen}
        setHighlightedCommentId={setHighlightedCommentId}
        userReactions={userReactionsLookup && comment.id ? userReactionsLookup[comment.id] : undefined}
        {...commentProps}
        isReplyable={true}
        onReplyPosted={setNewReplyId}
      />
      {linkedReplyId && !repliesOpen && (
        <Comment
          key={`${comment.id}-linked-reply`}
          highlighted={linkedReplyId === highlightedCommentId}
          comment={comment}
          video={video}
          indented
          setHighlightedCommentId={setHighlightedCommentId}
          userReactions={userReactionsLookup ? userReactionsLookup[linkedReplyId] : undefined}
          isReplyable={false}
        />
      )}
      {repliesOpen && (
        <>
          {replies?.map((comment) => (
            <Comment
              key={comment.id}
              highlighted={comment.id === highlightedCommentId}
              comment={comment}
              video={video}
              indented
              setHighlightedCommentId={setHighlightedCommentId}
              userReactions={userReactionsLookup ? userReactionsLookup[comment.id] : undefined}
              isReplyable={false}
            />
          ))}
          {placeholderItems.map((_, idx) => (
            <Comment key={idx} indented />
          ))}
          {repliesLeftToLoadCount > 0 ? (
            <LoadMoreRepliesButton
              variant="tertiary"
              onClick={handleLoadMore}
              icon={<SvgActionChevronB />}
              iconPlacement="right"
            >
              Load more replies ({repliesLeftToLoadCount})
            </LoadMoreRepliesButton>
          ) : null}
        </>
      )}
    </>
  )
}

export const CommentThread = memo(_CommentThread)

const LoadMoreRepliesButton = styled(TextButton)`
  justify-self: start;
  margin-left: ${sizes(14)};
`
