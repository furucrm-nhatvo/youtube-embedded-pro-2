import quip from 'quip-apps-api'
import React, { useEffect, useRef } from 'react'
import { RootEntity } from '../model/root'

export default function CommentHighlight() {
    const rootRecord = quip.apps.getRootRecord() as RootEntity

    useEffect(() => {
        rootRecord.listen(updateHighlight)
        return () => {
            rootRecord.unlisten(updateHighlight)
        }
    }, [])
    const updateHighlight = (record: quip.apps.RootRecord) => {
        const isHighlighted = record.get('commentHighlight')
        if (isHighlighted) {
            document.addEventListener('mousemove', handleAddCommentCursor)
        } else {
            const ele = addCommentCursorRef?.current as any
            if (ele) {
                ele.style.display = 'none'
            }
            document.removeEventListener('mousemove', handleAddCommentCursor)
        }
    }
    const handleAddCommentCursor = (e: any) => {
        const ele = addCommentCursorRef?.current as any
        if (ele) {
            ele.style.display = 'flex'
            const { x, y } = document.querySelector('.root')?.getBoundingClientRect() as any
            const offsetX = x || 95
            const offsetY = y || 768
            const offsetWidth = ele.getBoundingClientRect().width || 10
            const offsetHeight = ele.getBoundingClientRect().height || 10
            ele.style.left = `${e.pageX - offsetX - offsetWidth / 2}px`
            ele.style.top = `${e.pageY - offsetY - offsetHeight / 2}px`
        }
    }
    const addCommentCursorRef = useRef(null)
    return (
        <div ref={addCommentCursorRef} style={{ display: 'none', width: '10px', height: '10px', border: '1px solid grey', borderRadius: '50%', position: 'absolute', top: '0', alignItems: 'center', justifyContent: 'center', zIndex: '1000', pointerEvents: 'none' }}>
            <div style={{ width: '7px', height: '7px', background: '#ffae00', borderRadius: '50%' }}></div>
        </div>
    )
}
