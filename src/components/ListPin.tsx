import $ from "jquery";
import quip from 'quip-apps-api';
import React, { useMemo } from 'react';
import MyRecord from '../model/MyRecord';
import Item from './Item';

export default function ListPin({ listRecord, startTime, endTime, handler, vid }: { listRecord: MyRecord[], startTime: number, endTime: number, handler: any, vid:string }) {
    listRecord.sort(
        (r1: any, r2: any) => r1.get("time") - r2.get("time")
    );

   
    const rootRecord = quip.apps.getRootRecord()
    const goToTime = (id: string, time: number, pinIndex: number) => {
        handler.seekTo(id, time)
        const videoId = vid
        const itemHeight = document.querySelector('.li-item')?.getBoundingClientRect().height || 33
        const urlEle = document.querySelector('.url-'+ videoId) as HTMLElement
        if(!urlEle) return
        const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
        if(!scrollContainer) return
        const scrollToTopDistance = urlEle.offsetTop + itemHeight*(pinIndex+1) + rootRecord.get('height')
        if(scrollContainer.getBoundingClientRect().height < scrollToTopDistance) {
            scrollContainer.style.height = scrollToTopDistance + 'px'
        }
        $(".container").animate({ scrollTop: urlEle.offsetTop + itemHeight*(pinIndex+1) }, 500);
    }
   
    const displayListRecord = useMemo(() => {
        // const rootRecord = quip.apps.getRootRecord() as RootEntity;
        // let listData = rootRecord.getMyRecords().getRecords();
        listRecord.sort(
            (r1: any, r2: any) => r1.get("time") - r2.get("time")
        );
        return <div className="list-wrapper">
            {
                listRecord.map((item: any, index) => {
                    const { time, content, id, comment, comment2, likes, userPin, userUpdate, clickedPinList } = item.getData();
                    return (
                        <>
                            <Item
                                key={id}
                                id={id}
                                time={time}
                                content={content}
                                goToTime={(id: any, time: any) => goToTime(id, time, index)}
                                updateTime={handler.updateTime}
                                removeItem={handler.removeItem}
                                comment={comment}
                                comment2={comment2}
                                likes={likes}
                                handleLike={handler.handleLike}
                                userPin={userPin}
                                userUpdate={userUpdate}
                                handleUserUpdate={handler.handleUserUpdate}
                                clickedPinList={clickedPinList}
                                disabled={time < startTime || time > endTime}
                            />
                        </>
                    )
                })
            }
        </div>

    }, [listRecord])
    return <div className="list-wrapper"
    >
        {displayListRecord}
    </div>
}
