import quip from 'quip-apps-api'
import React from 'react'
import CommentableRecord from '../model/CommentableRecord'
import { RootEntity } from '../model/root'

export default function CommentToggleable({ comment }: { comment: CommentableRecord }) {
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    return (
        <>
            {rootRecord.get('commentHighlight') && <div style={{borderRadius:'4px'}} className={`comment-frame ${rootRecord.get('commentHighlight') ? 'add-comment' : ''}`} onClick={() => {
                if (rootRecord.get('commentHighlight')) {
                    (comment.getDom()?.firstChild as HTMLElement)?.click()
                    rootRecord.set("commentHighlight", false);
                }
            }}></div>}
            <div className={comment.getCommentCount() ? 'has-comment has-comment-border' : ''} onClick={() => {
                if (comment.getCommentCount()) {
                    (comment.getDom()?.firstChild as HTMLElement)?.click()
                }
            }}></div>
            <span
                className='custom-comment'
                ref={c => comment.setDom(c!)}
                style={{ cursor: 'pointer', pointerEvents: rootRecord.get('commentHighlight') ? 'auto' : 'none' }}
            >
                <quip.apps.ui.CommentsTrigger
                    record={comment}
                    showEmpty={true}
                    className="item-comment"
                />
            </span>
        </>
    )
}
