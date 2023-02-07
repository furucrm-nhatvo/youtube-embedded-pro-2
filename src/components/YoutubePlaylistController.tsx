import quip from 'quip-apps-api'
import RecordList from 'quip-apps-api/dist/record-list'
import React, { useEffect, useState } from 'react'
import { RootEntity } from '../model/root'
import YoutubeUrlRecord from '../model/YoutubeUrlRecord'
import { parseYoutubeVideoId } from '../utils'
import ListPin from './ListPin'
import Ruller from './Ruller'
import YoutubeUrlInfo from './YoutubeUrlInfo'

export default function YoutubePlaylistController(props: any) {
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    const youtubeUrlRecordList = rootRecord.getYoutubeUrlRecords()
    const [youtubeUrlRecords, setYoutubeUrlRecords] = useState<YoutubeUrlRecord[]>(youtubeUrlRecordList.getRecords())
    const [isListPinScrolling, setIsListPinScrolling] = useState<boolean>(false);
    const [scrollInterval, setScrollInterval] = useState<any>(null);
    const handleListPinScroll = () => {
        setIsListPinScrolling(true);
        if (scrollInterval) {
            clearInterval(scrollInterval);
        }
        const interval = setInterval(() => {
            setIsListPinScrolling(false);
            clearInterval(scrollInterval);
        }, 1000);
        setScrollInterval(interval);
    }
    useEffect(() => {
        youtubeUrlRecordList.listen(updateYoutubeUrlRecords)
        return () => {
            youtubeUrlRecordList.unlisten(updateYoutubeUrlRecords)
        }
    }, [])
    useEffect(() => {
        let interval: NodeJS.Timer
        if (props.player) {
            interval = listenToVideo()
        }
        return () => {
            clearInterval(interval)
        }
    }, [props.player, youtubeUrlRecords])
    const listenToVideo = () => {
        return setInterval(() => {
            const currentVideoId = parseYoutubeVideoId(props.player?.getVideoUrl())
            const currentRecord = youtubeUrlRecords.find(record => record.get('vid') === currentVideoId)
            if (!currentRecord) return
            const currentTime = props.player?.getCurrentTime() || 0

            const reachEndTimeCondition = currentRecord.get('endTime') < currentTime && currentTime - currentRecord.get('endTime') < 2
            const reachEndVideoCondition = props.player?.getPlayerState() === 0
            if (reachEndTimeCondition || reachEndVideoCondition) {
                const currentRecordIndex = youtubeUrlRecords.indexOf(currentRecord)
                if (currentRecordIndex === youtubeUrlRecords.length - 1) {
                    props.player?.pauseVideo()
                    return
                }
                const nextRecord = youtubeUrlRecords[currentRecordIndex + 1]
                if (!nextRecord || !nextRecord.get('vid')) return
                props.player?.loadVideoById({
                    'videoId': nextRecord.get('vid'),
                    'startSeconds': nextRecord.get('startTime') || 0,
                    // 'endSeconds': 60
                });
                rootRecord.set('embedUrl', nextRecord.get('embedUrl'))
                rootRecord.set('shareUrl', nextRecord.get('url'))
                rootRecord.set('vid', nextRecord.get('vid'))
                rootRecord.set('startTime', nextRecord.get('startTime'))
            }
        }, 1000)
    }
    const updateYoutubeUrlRecords = (recordList: RecordList<YoutubeUrlRecord>) => {
        setYoutubeUrlRecords(recordList.getRecords())
    }
    return (
        <>
            <div 
                 className={"container" + (isListPinScrolling ? "" : " hide-scrollbar")}
                onScroll={handleListPinScroll}
                style={{ height: rootRecord.get('height') + 'px', overflow: 'auto' }}
                >
                <div className='scroll-container' style={{position:'relative'}}>
                {
                    youtubeUrlRecords.map((record, index) => {
                        const listPin = rootRecord.getMyRecords().getRecords().filter(myRecord => record.get('vid') && myRecord.get('vid') === record.get('vid'))
                        return <>
                            <YoutubeUrlInfo key={record.getId()} record={record} index={index} player={props.player} listPin={listPin}></YoutubeUrlInfo>
                            <ListPin
                                vid={record.get('vid')}
                                listRecord={listPin}
                                startTime={record.get('startTime')}
                                endTime={record.get('endTime')}
                                handler={{
                                    seekTo: props.seekTo,
                                    updateTime: props.updateTime,
                                    removeItem: props.removeItem,
                                    handleLike: props.handleLike,
                                    handleUserUpdate: props.handleUserUpdate,
                                }}

                            ></ListPin>
                        </>
                    })
                }
                </div>
            </div>
            <Ruller containerCls='container' wrapperCls='root' minHeight={200} rootRecordVar='height'></Ruller>
        </>
    )
}
