import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBackward, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import $ from "jquery";
import quip from 'quip-apps-api';
import React, { useEffect, useRef, useState } from 'react';
import ReactTooltip from "react-tooltip";
import AnalysisIcon from "../components/AnalysisIcon";
import MyRecord from '../model/MyRecord';
import { RootEntity } from '../model/root';
import { parseYoutubeVideoId, secondsToTimeString } from '../utils';
import Analysis from './Analysis';
import YoutubePlaylistController from './YoutubePlaylistController';
export default (props: any) => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    const [listRecord, setListRecord] = useState<MyRecord[]>(props.listRecords || []);
    
    const [playerState, setPlayerState] = useState(props.videoState);

    const [playbackRateInput, setPlaybackRateInput] = useState('1.00')
    
    const videoPinRef: any = useRef();
    const [showTimeline, setShowTimeline] = useState<boolean>(false);
    const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
    
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
        if (props.listRecords != null) {
            setListRecord(props.listRecords)
        }

    }, [props.listRecords])
    const clickPin = () => {
        const id = props.pin();
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        const videoId = parseYoutubeVideoId(props.player?.getVideoUrl())
        let listData = rootRecord.getMyRecords().getRecords().filter(record=>record.get('vid') === videoId);
        listData.sort(
            (r1: any, r2: any) => r1.get("time") - r2.get("time")
        );
        const pinIndex = listData.findIndex(record=>record.getId()===id)
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
        
        // const clickedPinIndex = listData.findIndex(item => item.getData().id === id)
        

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
    const seekTo = (id: string, time : number)=>{
        const playingVideoId = parseYoutubeVideoId(props.player?.getVideoUrl())
        if(!playingVideoId) return
        const currentVideoRecord = rootRecord.getYoutubeUrlRecords().getRecords().find(record=>record.get('vid') === playingVideoId)
        const videoIdInPin = rootRecord.getMyRecords().getRecords().find(record=>record.getId() === id)?.get('vid')
        if(videoIdInPin !== playingVideoId){
            props.player?.loadVideoById({
                'videoId': videoIdInPin,
                'startSeconds' : time
            });
            if(!currentVideoRecord) return
            rootRecord.set('embedUrl', currentVideoRecord.get('embedUrl'))
            rootRecord.set('shareUrl', currentVideoRecord.get('url'))
            rootRecord.set('vid', currentVideoRecord.get('vid'))
            rootRecord.set('startTime', currentVideoRecord.get('startTime'))
        } else {
            props.player?.seekTo(time);
        }
        
        props.seekTo(id, time)
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
        return () => {
            rootRecord.unlisten(updateRecords)
        }
    }, [])
    const updateRecords = (rootRecord: RootEntity) => {
        setListRecord(rootRecord.getMyRecords().getRecords())
    }
    
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
    return (
        <>
            {/* Video Control */}
            <div
                className="container-pin"
                tabIndex={0}
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
                        <FontAwesomeIcon icon={faBackward as IconProp} className="playback__icon" />
                    </button>
                    <button className="mx-3" onClick={() => handleBackwardAndForward(-5)} data-tip="-5sec">
                        <FontAwesomeIcon icon={faPlay as IconProp} flip="horizontal" className="playback__icon" />
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
                        <FontAwesomeIcon icon={faPlay as IconProp} className="playback__icon" />
                    </button>
                    <button onClick={() => handleBackwardAndForward(10)} data-tip="+10sec">
                        <FontAwesomeIcon icon={faBackward as IconProp} flip="horizontal" className="playback__icon" />
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
            {!showAnalysis 
                && <YoutubePlaylistController 
                        player={props.player} 
                        seekTo={seekTo}
                        updateTime={updateTime}
                        removeItem={removeItem}
                        handleLike={handleLike}
                        handleUserUpdate={handleUserUpdate}
                    ></YoutubePlaylistController>
                
            }


            {/* Pin List */}
            {/* {!showAnalysis && <div
                className={"list-pin" + (isListPinScrolling ? "" : " hide-scrollbar")}
                onScroll={handleListPinScroll}
                style={{ height: `calc(100% - ${showTimeline ? 110 : 70}px)` }}>
                {displayListRecord}
            </div>} */}
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