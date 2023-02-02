import React, { useRef, createRef, useEffect, useMemo, useState } from 'react';
import { faClipboard, faCheck, faLocationDot, faPlay, faBackward } from "@fortawesome/free-solid-svg-icons";
import $ from "jquery";
import Item from './Item';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import quip from 'quip-apps-api';
import { RootEntity } from '../model/root';
import Timeline from './Timeline';
import ReactTooltip from "react-tooltip";
import moment from 'moment';
import AnalysisIcon from "../components/AnalysisIcon";
import ClockRotateRightIcon from "../components/ClockRotateRightIcon";
import Analysis from './Analysis';
import { secondsToTimeString } from '../utils';
import DialogWrapper from './DialogWrapper';
import MyRecord from '../model/MyRecord';
import YoutubeUrlRecord from '../model/YoutubeUrlRecord';
import YoutubeUrlInfo from './YoutubeUrlInfo';
import RecordList from 'quip-apps-api/dist/record-list';
export default (props: any) => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    const youtubeUrlRecordList = rootRecord.getYoutubeUrlRecords()
    const [listRecord, setListRecord] = useState<MyRecord[]>(props.listRecords || []);
    const [youtubeUrlRecords, setYoutubeUrlRecords] = useState<YoutubeUrlRecord[]>(youtubeUrlRecordList.getRecords())
    const [playerState, setPlayerState] = useState(props.videoState);
    const [listHeight, setListHeight] = useState<any>("auto");
    const [maxLine, setMaxLine] = useState(5);
    const [playbackRateInput, setPlaybackRateInput] = useState('1.00')
    const [copied, setCopy] = useState(false)
    const [isListPinScrolling, setIsListPinScrolling] = useState<boolean>(false);
    const ulRef: any = createRef()
    const videoPinRef: any = useRef();
    const [showTimeline, setShowTimeline] = useState<boolean>(false);
    const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
    const [selectedTimeIndex, setTimeIndex] = useState<undefined | string>(undefined);
    const [scrollInterval, setScrollInterval] = useState<any>(null);
    const [isImportDialogOpen, setOpenImportDialog] = useState(false)
    const itemRefs = useMemo(() => {
        return props.listRecords
            .sort((r1: any, r2: any) => r1.get("time") - r2.get("time"))
            .map((e: any) => {
                return {
                    id: e.getData().id,
                    ref: createRef()
                }
            });
    }, [props.listRecords]);
    const [listPinHeight, setListPinHeight] = useState<any>("auto");
    useEffect(() => {
        const rootRecord = props.rootRecord;
        setShowTimeline(rootRecord.getData().showTimeline);
        // setShowAnalysis(rootRecord.getData().showAnalysis);
        // Add event listener
        document.addEventListener("keyup", (event: any) => {
            if (event.ctrlKey && event.altKey && (event.key === "p" || event.which == 80)) {
                if (videoPinRef.current) {
                    videoPinRef.current.focus();
                }
            }
        });
        videoPinRef.current.addEventListener("keydown", function (event: any) {
            if (event.which === 38 || event.key === "ArrowUp") {
                event.preventDefault();
            }
            if (event.which === 40 || event.key === "ArrowDown") {
                event.preventDefault();
            }
        }, false);
    }, []);
    useEffect(() => {
        setPlayerState(props.videoState)
    }, [props.videoState])
    useEffect(() => {
        let total: number = 0;
        if (listRecord.length > maxLine) {
            $(".li-item").each(function (index: number) {
                total = total + Number($(this).outerHeight());
                if (index + 1 == maxLine) {
                    setListHeight(total)
                    props.updateHeight(total);
                }
            })
        } else {
            if (listHeight !== "auto") {
                setListHeight("auto")
                props.updateHeight(0);
            }
        }

    }, [listRecord, maxLine])
    useEffect(() => {
        if (props.listRecords != null) {
            setListRecord(props.listRecords)
        }

    }, [props.listRecords])
    const clickPin = () => {
        const id = props.pin();
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        let listData = rootRecord.getMyRecords().getRecords();
        listData.sort(
            (r1: any, r2: any) => r1.get("time") - r2.get("time")
        );
        const clickedPinIndex = listData.findIndex(item => item.getData().id === id)
        setTimeout(() => {
            const allItems = document.querySelectorAll('.li-item')

            if (clickedPinIndex !== undefined) {
                const item = allItems[clickedPinIndex]
                if (item) {
                    const itemHeightTotal = Array.from(allItems).slice(0, allItems.length - 1)
                        .map((e: any) => e.offsetHeight)
                        .reduce((a: number, b: number) => a + b, 0);
                    if (showTimeline) setListPinHeight(itemHeightTotal + props.parentHeight - 85);
                    else setListPinHeight(itemHeightTotal + props.parentHeight - 45);
                    const timeout = setTimeout(() => {
                        const scrollHeight = Array.from(allItems).slice(0, clickedPinIndex)
                            .map((e: any) => e.offsetHeight)
                            .reduce((a: number, b: number) => a + b, 0);
                        $(".list-pin").animate({
                            scrollTop: scrollHeight
                        }, 500);
                        clearTimeout(timeout);
                    }, 200);
                }
            }
        }, 0)

    }
    const playOrPauseVideo = () => {
        props.playOrPauseVideo();
    }
    const parsePinDataToString = () => {
        let clipboarStr = "";
        listRecord.forEach((item: any) => {
            const { time, content } = item.getData();

            clipboarStr += `${props.duration < 3600 ? secondsToTimeString(time).replace("00:", "") : secondsToTimeString(time)} ${content.getTextContent().trim() === 'Add content' ? '' : content.getTextContent().trim()} \n`;
        })
        return clipboarStr;

    }
    const saveToClipboard = () => {
        if (!copied) setCopy(true);
        const textArea = document.createElement("textarea");
        textArea.value = parsePinDataToString();
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Unable to copy');
        }

        document.body.removeChild(textArea);
        setTimeout(() => {
            setCopy(false)
        }, 500)
    }
    const goToTime = (id: string, time: number, clickedPinIndex: number | undefined) => {
        props.seekTo(id, time)
        setTimeIndex(id)
        const timeout = setTimeout(() => {
            setTimeIndex(undefined)
            clearTimeout(timeout);
        }, 2000);
        // Scroll to time line when clicking on time pin
        if (clickedPinIndex !== undefined) {
            const item = itemRefs.find((e: any) => e.id === id);
            if (item?.ref.current) {
                const itemHeightTotal = itemRefs.slice(0, itemRefs.length - 1)
                    .map((e: any) => e.ref.current.offsetHeight)
                    .reduce((a: number, b: number) => a + b, 0);
                setListPinHeight(itemHeightTotal + props.parentHeight - 85);
                const timeout = setTimeout(() => {
                    const scrollHeight = itemRefs.slice(0, clickedPinIndex)
                        .map((e: any) => e.ref.current.offsetHeight)
                        .reduce((a: number, b: number) => a + b, 0);
                    $(".list-pin").animate({
                        scrollTop: scrollHeight
                    }, 500);
                    clearTimeout(timeout);
                }, 200);
            }
        }
    }
    const updateTime = (id: string, time: number) => {
        props.updateTime(id, time);
    }
    const removeItem = (id: string) => {
        props.removeItem(id);
    }
    const handleLike = (id: string, user: quip.apps.User) => {
        props.handleLike(id, user);
    }
    const handleUserUpdate = (id: string) => {
        props.handleUserUpdate(id);
    }
    useEffect(() => {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        rootRecord.listen(updateRecords)
        youtubeUrlRecordList.listen(updateYoutubeUrlRecords)
        return () => {
            rootRecord.unlisten(updateRecords)
            youtubeUrlRecordList.unlisten(updateYoutubeUrlRecords)
        }
    }, [])
    const updateRecords = (rootRecord: RootEntity) => {
        setListRecord(rootRecord.getMyRecords().getRecords())
    }
    const updateYoutubeUrlRecords =(recordList:RecordList<YoutubeUrlRecord>)=>{
        setYoutubeUrlRecords(recordList.getRecords())
    }
    const displayListRecord = useMemo(() => {
        // const rootRecord = quip.apps.getRootRecord() as RootEntity;
        // let listData = rootRecord.getMyRecords().getRecords();
        listRecord.sort(
            (r1: any, r2: any) => r1.get("time") - r2.get("time")
        );
        return <div className="list-wrapper" ref={ulRef} style={{ height: listPinHeight }}>
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
                                updateTime={updateTime}
                                removeItem={removeItem}
                                comment={comment}
                                comment2={comment2}
                                likes={likes}
                                handleLike={handleLike}
                                userPin={userPin}
                                userUpdate={userUpdate}
                                handleUserUpdate={handleUserUpdate}
                                clickedPinList={clickedPinList}
                                ref={itemRefs.find((e: any) => e.id === id)?.ref}
                            />
                        </>
                    )
                })
            }
        </div>

    }, [listHeight, ulRef, listRecord])
    const handleKeyDown = (e: any) => {
        const keyCode = e.keyCode
        if (
            keyCode != 46 &&
            keyCode > 31 &&
            (keyCode < 37 || keyCode > 40) &&
            (keyCode < 48 || keyCode > 57) &&
            (keyCode < 96 || keyCode > 105)
        ) {

            e.preventDefault()
            e.stopPropagation()
            return false
        }

    }
    const increasePlaybackRate = () => {
        const playbackRate = Number(playbackRateInput)
        if (playbackRate < 2) {
            const newRate: number = Number((playbackRate + 0.1).toFixed(1));
            if (newRate.toString().length === 1) {
                setPlaybackRateInput(newRate.toString() + '.00')
            } else setPlaybackRateInput(newRate.toString() + '0');
            props.changePlaybackRate(newRate);
        }
    }
    const decreasePlaybackRate = () => {
        const playbackRate = Number(playbackRateInput)
        if (playbackRate > 0.1) {
            const newRate: number = Number((playbackRate - 0.1).toFixed(1));
            if (newRate.toString().length === 1) {
                setPlaybackRateInput(newRate.toString() + '.00')
            } else setPlaybackRateInput(newRate.toString() + '0');
            props.changePlaybackRate(newRate);
        }
    }

    const handlePlaybackRateInput = (e: any) => {
        let value = e.target.value
        if (value.length <= 4) {
            setPlaybackRateInput(value)
        }

    }
    const changePlaybackRate = () => {
        let value = playbackRateInput;
        if (Number(value)) {
            if (Number(value) <= 2) {
                if (value.length == 1) {
                    value = value + '.00';
                } else if (value.length == 2 && value.includes('.')) {
                    value = value + '00';
                } else if (value.length == 3 && value.includes('.')) {
                    value = value + '0';
                } else if (value.length == 4) {
                    value = value.slice(0, 3) + '0';
                }
                setPlaybackRateInput(value);
                props.changePlaybackRate(Number(value));
            } else {
                setPlaybackRateInput('2.00');
                props.changePlaybackRate(2);
            }
        } else {
            setPlaybackRateInput('1.00');
            props.changePlaybackRate(1);
        }
    }
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
    const changeShowTimeline = () => {
        const _showTimeline = !showTimeline;
        setShowTimeline(_showTimeline);
        const rootRecord = props.rootRecord;
        rootRecord.set("showTimeline", _showTimeline);
    }
    const changeShowAnalysis = (event: any) => {
        event.stopPropagation();
        const _showAnalysis = !showAnalysis;
        setShowAnalysis(_showAnalysis);
        const rootRecord = props.rootRecord;
        rootRecord.set("showAnalysis", _showAnalysis);
    }
    const toggleComment = (event: any) => {
        event.stopPropagation();
        rootRecord.set("commentHighlight", !rootRecord.get('commentHighlight'));
    }
    const handleBackwardAndForward = (time: number) => {
        props.seekTo(null, time);
    }
    const addEventForVideoPin = (event: any) => {
        if (event.target !== event.currentTarget) return;
        if (event.which === 32 || event.key === " ") {
            playOrPauseVideo();
        }
        if (event.which === 38 || event.key === "ArrowUp") {
            increasePlaybackRate();
        }
        if (event.which === 40 || event.key === "ArrowDown") {
            decreasePlaybackRate();
        }
        if (event.which === 37 || event.key === "ArrowLeft") {
            handleBackwardAndForward(-5);
        }
        if (event.which === 39 || event.key === "ArrowRight") {
            handleBackwardAndForward(5);
        }
    }

    useEffect(() => {
        if (videoPinRef.current) {
            videoPinRef.current.addEventListener("keyup", addEventForVideoPin);
        }
        return () => {
            if (videoPinRef.current) {
                videoPinRef.current.removeEventListener("keyup", addEventForVideoPin);
            }
        }
    }, [playbackRateInput]);
    const deleteRecord = (index:number)=>{
        const record = youtubeUrlRecordList.get(index)
        youtubeUrlRecordList.remove(record)
    }
    return (
        <>
            {/* Video Control */}
            <div
                className="container-pin"
                tabindex="0"
                id="video-pin"
                ref={videoPinRef}
            >
                {!showAnalysis && <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    {/* Pin Button */}
                    <div>
                        <button className="btn-pin" onClick={() => clickPin()}>Note!</button>
                    </div>
                </div>}
                {/* Playback */}
                {!showAnalysis && <div className="playback">
                    <button onClick={() => handleBackwardAndForward(-10)} data-tip="-10sec">
                        <FontAwesomeIcon icon={faBackward} className="playback__icon" />
                    </button>
                    <button className="mx-3" onClick={() => handleBackwardAndForward(-5)} data-tip="-5sec">
                        <FontAwesomeIcon icon={faPlay} flip="horizontal" className="playback__icon" />
                    </button>
                    <button onClick={decreasePlaybackRate}>-</button>
                    <input
                        id='playback'
                        type="text"
                        value={playbackRateInput}
                        onChange={handlePlaybackRateInput}
                        onBlur={changePlaybackRate}
                        onKeyPress={(evt: any) => {
                            if (evt.keyCode === 13 || evt.key === "Enter") {
                                changePlaybackRate();
                            }
                        }}
                    />
                    <button onClick={increasePlaybackRate}>+</button>
                    <button className="mx-3" onClick={() => handleBackwardAndForward(5)} data-tip="+5sec">
                        <FontAwesomeIcon icon={faPlay} className="playback__icon" />
                    </button>
                    <button onClick={() => handleBackwardAndForward(10)} data-tip="+10sec">
                        <FontAwesomeIcon icon={faBackward} flip="horizontal" className="playback__icon" />
                    </button>
                </div>}
                <div className="video-pin__right-toolbar">
                    {/* Show/Hide Timeline Button */}
                    {!showAnalysis && <button
                        style={{ backgroundColor: "transparent", border: "none", display: 'flex', fill: rootRecord.get('commentHighlight') ? "#0fd7b7" : "#b4b4b4", cursor: 'pointer' }}
                        onClick={toggleComment}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 48 48' width={23}><path d="m2 46 3.6-12.75q-1-2.15-1.45-4.425-.45-2.275-.45-4.675 0-4.2 1.575-7.85Q6.85 12.65 9.6 9.9q2.75-2.75 6.4-4.325Q19.65 4 23.85 4q4.2 0 7.85 1.575Q35.35 7.15 38.1 9.9q2.75 2.75 4.325 6.4Q44 19.95 44 24.15q0 4.2-1.575 7.85-1.575 3.65-4.325 6.4-2.75 2.75-6.4 4.325-3.65 1.575-7.85 1.575-2.4 0-4.675-.45T14.75 42.4Zm4.55-4.55 6.9-1.9q.8-.25 1.5-.175.7.075 1.45.375 1.8.7 3.675 1.125 1.875.425 3.775.425 7.15 0 12.15-5t5-12.15Q41 17 36 12T23.85 7Q16.7 7 11.7 12t-5 12.15q0 1.95.275 3.85.275 1.9 1.275 3.6.35.7.375 1.45.025.75-.175 1.5Zm15.8-9.25h3v-6.35h6.4v-3h-6.4v-6.4h-3v6.4h-6.4v3h6.4Zm1.45-8Z" /></svg>
                    </button>}
                    {!showAnalysis && <button style={{ backgroundColor: "transparent", border: "none" }}>
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            color={showTimeline ? "#0fd7b7" : "#b4b4b4"}
                            style={{ height: '20px', width: '20px', cursor: "pointer" }}
                            onClick={changeShowTimeline}
                            data-tip="Show Timeline"
                        />
                    </button>}
                    {/* Open play counter dialog */}
                    <button data-tip="View Report"
                        style={{ cursor: "pointer", backgroundColor: "transparent", border: "none" }}
                        onClick={changeShowAnalysis}
                    >
                        <AnalysisIcon
                            width="20"
                            height="20"
                            color={showAnalysis ? "#0fd7b7" : "#b4b4b4"}
                        />
                    </button>
                </div>
            </div>
            {/* Timeline */}
            {!showAnalysis && showTimeline && <Timeline duration={props.duration} goToTime={goToTime} timeIndex={selectedTimeIndex} />}
            {/* Pin List Title */}
            {/* {!showAnalysis && <div className="list-pin__title">
                <div className="timeline-link" style={{ paddingLeft: '8px', gap: '8px' }}>
                    <div style={{ cursor: 'pointer', display: 'flex' }} onClick={props.openImportDialog}>
                        <ClockRotateRightIcon width="15" height="15" />
                    </div>
                    <span>Timeline</span>

                </div>
                <div className="views-likes">Views / Likes</div>
                <div className="comments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p>Comments</p>
                    <div>
                        {copied
                            ?
                            <div style={{ display: 'flex' }}>
                                <FontAwesomeIcon icon={faCheck} color='green' style={{ height: '15px', width: '15px' }} />
                            </div>
                            : <div onClick={saveToClipboard} data-tip="Copy Timeline text" style={{ display: 'flex' }}>
                                <FontAwesomeIcon icon={faClipboard} color='white' style={{ cursor: 'pointer', height: '15px', width: '15px' }} />
                            </div>
                        }
                    </div>
                </div>
            </div>} */}
            {!showAnalysis &&
                youtubeUrlRecords.map((record, index) => {
                    return <YoutubeUrlInfo key={record.getId()} record={record} index={index}></YoutubeUrlInfo>
                })
            }


            {/* Pin List */}
            {!showAnalysis && <div
                className={"list-pin" + (isListPinScrolling ? "" : " hide-scrollbar")}
                onScroll={handleListPinScroll}
                style={{ height: `calc(100% - ${showTimeline ? 110 : 70}px)` }}>
                {displayListRecord}
            </div>}
            {showAnalysis && <Analysis />}
            <ReactTooltip
                place="top"
                type="dark"
                effect="solid"
                delayShow={1000}
            />
        </>
    )
}