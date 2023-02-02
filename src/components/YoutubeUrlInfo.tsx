import quip from "quip-apps-api";
import React, { useCallback, useState } from "react";
import { RootEntity } from "../model/root";
import YoutubeUrlRecord from "../model/YoutubeUrlRecord";
import { debounce } from 'lodash';
import CommentToggleable from "./CommentToggleable";

const hourMinuteToSecond = (str: string) => {
    const [hours, minutes, seconds] = str.split(":")
    return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
}

const secondToHourMinute = (seconds: number) => {
    let date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().slice(11, 19).split(':');
}


function generateTimeDisplay(max = 24) {
    return Array(max).fill(0).map((_, index) => '00'.slice(`${index}`.length) + index)
}
export default function YoutubeUrlInfo({
    index,
    record,
}: {
    index: number;
    record: YoutubeUrlRecord;
}) {
    const rootRecord = quip.apps.getRootRecord() as RootEntity
    const youtubeUrlRecordList = rootRecord.getYoutubeUrlRecords()
    const content = record.getContent();
    const { commentUrl, commentStartTime, commentEndTime, commentContent } = record.getData()
    const [url, setUrl] = useState(record.getData().url)
    const [isEdit, setEdit] = useState(false)
    const [startHours, setStartHours] = useState(secondToHourMinute(record.getData().startTime)[0])
    const [startMinutes, setStartMinutes] = useState(secondToHourMinute(record.getData().startTime)[1])
    const [startSeconds, setStartSeconds] = useState(secondToHourMinute(record.getData().startTime)[2])
    const [endHours, setEndHours] = useState(secondToHourMinute(record.getData().endTime)[0])
    const [endMinutes, setEndMinutes] = useState(secondToHourMinute(record.getData().endTime)[1])
    const [endSeconds, setEndSeconds] = useState(secondToHourMinute(record.getData().endTime)[2])
    const handleChangeUrl = (event: any) => {
        setUrl(event.target.value)
    }
    const addRecord = () => {
        const newRecord = youtubeUrlRecordList.add({}, index + 1)
        newRecord.set('startTime', record?.get('endTime') || 0)
        newRecord.set('endTime', record?.get('endTime') || 0)
    }
    const deleteRecord = () => {
        youtubeUrlRecordList.remove(record)
        if(youtubeUrlRecordList.getRecords().length === 0){
            rootRecord.set('embedUrl', undefined)
            rootRecord.set('shareUrl', undefined)
            rootRecord.set('vid', undefined)
        }
    }

    const hoursConst = generateTimeDisplay(24)
    const minutesConst = generateTimeDisplay(60)
    const secondsConst = generateTimeDisplay(60)
    const handler = useCallback(debounce((value: number, field: string) => {
        record.set(field, value)
        if (field === 'startTime') {
            setStartHours(secondToHourMinute(value)[0])
            setStartMinutes(secondToHourMinute(value)[1])
            setStartSeconds(secondToHourMinute(value)[2])
            return
        }
        if (field === 'endTime') {
            setEndHours(secondToHourMinute(value)[0])
            setEndMinutes(secondToHourMinute(value)[1])
            setEndSeconds(secondToHourMinute(value)[2])
            return
        }
    }, 500), []);

    const handleInputChange = (evt: any) => {
        const { value, name } = evt.target
        const timeString = '00'.slice(value.length) + value
        if (name.includes('start')) {
            if (name.includes('Hours')) {
                if (hoursConst.includes(timeString)) {
                    setStartHours(value)
                    handler(hourMinuteToSecond(`${timeString}:${startMinutes}:${startSeconds}`), 'startTime')
                }
                return
            }
            if (name.includes('Minutes')) {
                if (minutesConst.includes(timeString)) {
                    setStartMinutes(value)
                    handler(hourMinuteToSecond(`${startHours}:${timeString}:${startSeconds}`), 'startTime')
                }
                return
            }
            if (name.includes('Seconds')) {
                if (secondsConst.includes(timeString)) {
                    setStartSeconds(value)
                    handler(hourMinuteToSecond(`${startHours}:${startMinutes}:${timeString}`), 'startTime')
                }
                return
            }
            return
        }
        if (name.includes('end')) {
            if (name.includes('Hours')) {
                if (hoursConst.includes(timeString)) {
                    setEndHours(value)
                    handler(hourMinuteToSecond(`${timeString}:${endMinutes}:${endSeconds}`), 'endTime')
                }
                return
            }
            if (name.includes('Minutes')) {
                if (minutesConst.includes(timeString)) {
                    setEndMinutes(value)
                    handler(hourMinuteToSecond(`${endHours}:${timeString}:${endSeconds}`), 'endTime')
                }
                return
            }
            if (name.includes('Seconds')) {
                if (secondsConst.includes(timeString)) {
                    setEndSeconds(value)
                    handler(hourMinuteToSecond(`${endHours}:${endMinutes}:${timeString}`), 'endTime')
                }
                return
            }
            return
        }
    }
    const handleUnfocusInput = (evt: any) => {
        const { value, name } = evt.target
        const timeString = '00'.slice(value.length) + value
        if (name.includes('start')) {
            if (name.includes('Hours')) {
                setStartHours(timeString)
                return
            }
            if (name.includes('Minutes')) {
                setStartMinutes(timeString)
                return
            }
            if (name.includes('Seconds')) {
                setStartSeconds(timeString)
                return
            }
            return
        }
        if (name.includes('end')) {
            if (name.includes('Hours')) {
                setEndHours(timeString)
                return
            }
            if (name.includes('Minutes')) {
                setEndMinutes(timeString)
                return
            }
            if (name.includes('Seconds')) {
                setEndSeconds(timeString)
                return
            }
        }

    }
    return (
        <div
            style={{
                background: "black",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}
        >
            {isEdit
                ? <div
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    onMouseLeave={() => {
                        setEdit(false)
                    }}
                >
                    <div
                        onClick={addRecord}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "25px",
                            height: "25px",
                            background: "#19e76b",
                            color: "white",
                            border: "2px solid white",
                            borderRadius: "4px",
                            flexShrink: '0',
                            cursor: 'pointer'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={13} fill='white'><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                    </div>
                    <div
                        onClick={deleteRecord}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "25px",
                            height: "25px",
                            background: "red",
                            color: "white",
                            border: "2px solid white",
                            borderRadius: "4px",
                            flexShrink: '0',
                            cursor: 'pointer'
                        }}
                    >
                        <svg width={18} viewBox="0 0 24 24" fill='white'> <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /> </svg>
                    </div>
                </div>
                : <div
                    onMouseEnter={() => setEdit(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "25px",
                        height: "25px",
                        background: "#197e6b",
                        color: "white",
                        border: "2px solid white",
                        borderRadius: "4px",
                        flexShrink: '0',
                        cursor: 'pointer'
                    }}
                >
                    {index + 1}
                </div>
            }
            <div style={{ position: 'relative' }}>
                <CommentToggleable comment={commentUrl}></CommentToggleable>
                <input style={{ background: 'white', height: '25px', width: '220px', flexShrink: '0' }}
                    value={url}
                    onChange={handleChangeUrl}
                ></input>
            </div>
            <div style={{ position: 'relative', background: "white", borderRadius: "4px", width: "80px", height: '25px', flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CommentToggleable comment={commentStartTime}></CommentToggleable>
                <input
                    type='number'
                    value={startHours}
                    name='startHours'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
                <p style={{ marginTop: '12px' }}>:</p>
                <input
                    type='number'
                    value={startMinutes}
                    name='startMinutes'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
                <p style={{ marginTop: '12px' }}>:</p>
                <input
                    type='number'
                    value={startSeconds}
                    name='startSeconds'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
            </div>
            <div style={{ position: 'relative', background: "white", borderRadius: "4px", width: "80px", height: '25px', flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CommentToggleable comment={commentEndTime}></CommentToggleable>
                <input
                    type='number'
                    value={endHours}
                    name='endHours'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
                <p style={{ marginTop: '12px' }}>:</p>
                <input
                    type='number'
                    value={endMinutes}
                    name='endMinutes'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
                <p style={{ marginTop: '12px' }}>:</p>
                <input
                    type='number'
                    value={endSeconds}
                    name='endSeconds'
                    onChange={handleInputChange}
                    onBlur={handleUnfocusInput}
                    style={{ width: '22px', border: 'none', padding: '2px' }}
                ></input>
            </div>
            <div style={{ position: 'relative', background: "white", width: "100%", borderRadius: "4px", padding: '2px 10px' }}>
                <CommentToggleable comment={commentContent}></CommentToggleable>
                <quip.apps.ui.RichTextBox record={content}></quip.apps.ui.RichTextBox>
            </div>
        </div>
    );
}