import React, { useEffect, useRef, useState } from "react";
import quip from "quip-apps-api";
import { RootEntity } from "../model/root";
import { formatTime } from "../utils/AppUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faThumbsUp, faComment, faPlay } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import stringWidth from "string-width";
export default (props: any) => {
  const [lineWidth, setLineWidth] = useState<number>(0);
  const timelineRef = useRef(null);
  const [selectedTimeColor, setTimeColor] = useState("#07d7b7");
  const [selectedIndex,setIndex]=useState(props.timeIndex)
  useEffect(() => {
    const timelineElement: any = timelineRef.current;
    const w = timelineElement ? timelineElement.clientWidth : 0;
    setLineWidth(w);
  }, [timelineRef]);
  useEffect(() => {
    if (props.timeIndex!==undefined) {
      setIndex(props.timeIndex)
      setTimeColor("#077060");
      const timeout= setTimeout(() => {
        setTimeColor("#07d7b7");
        clearTimeout(timeout)
      }, 2000);
    }
  }, [props.timeIndex]);
  const timeline = () => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    return (
      <>
        {rootRecord
          .getMyRecords()
          .getRecords()
          .sort((r1: any, r2: any) => r1.get("time") - r2.get("time"))
          .map((item: any, index: number) => {
            const { id, time, likes, content, comment, clickedPinList } = item.getData();
            comment.listenToComments((r: quip.apps.Record) => {
              setTimeColor(r.getCommentCount() === 0 ? "#07d7b7" : "#f18e00");
            });
            let color = comment.getCommentCount() === 0 ? "#07d7b7" : "#f18e00";
            if (id === props.timeIndex) {
              color = selectedTimeColor;
            }
            let zIndex = 1;
            if (id === selectedIndex) {
              zIndex = 2;
            }
            const w = lineWidth ? lineWidth : 0;
            const position =
              time <= props.duration ? (w * time) / props.duration : w;
            // Calculate clicked pin total
            const clickedPinTotal = clickedPinList
              .map((e: any) => e.clickedPinCount)
              .reduce((a: number, b: number) => a + b, 0);
            // Content: display 30 fullwidth characters or 60 halfwidth characters
            const _content = content.getTextContent();
            const _contentLength = [..._content]
              .map(c => stringWidth(c))
              .reduce((a: number, b: number) => a + b, 0);
            let shortContent = "";
            let contentLength = 0;
            let contentIndex = 0;
            while (contentLength < 60 && contentIndex < _content.length) {
              contentLength += stringWidth(_content[contentIndex]);
              shortContent += _content[contentIndex];
              contentIndex++;
            }
            if (_contentLength !== contentLength) {
              shortContent += "...";
            }
            return (
              <>
                <FontAwesomeIcon
                  style={{ left: position, zIndex: zIndex }}
                  icon={faLocationDot}
                  onClick={() => {
                    props.goToTime(id, time, index);
                  }}
                  color={color}
                  data-tip
                  data-for={"timeline" + index}
                />
                <ReactTooltip
                  id={"timeline" + index}
                  place="right"
                  type="dark"
                  globalEventOff="click"
                  className="timeline__tooltip-custom"
                  clickable={true}
                >
                  <div className="timeline__tooltip">
                    <div className="timeline__tooltip-time">
                      {formatTime(time)}
                    </div>
                    <div className="timeline__tooltip-info">
                      <div>
                        <FontAwesomeIcon icon={faPlay} />
                        <span className="mr-10 ml-5">{clickedPinTotal}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        <span className="mr-10 ml-5">{likes.length}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faComment} />
                        <span className="ml-5">{comment.getCommentCount()}</span>
                      </div>
                    </div>
                    {content && content.getTextContent() && (
                      <div className="timeline__tooltip-comment">
                        { shortContent }
                      </div>
                    )}
                  </div>
                </ReactTooltip>
              </>
            );
          })}
      </>
    );
  };

  return (
    <div className="timeline">
      <div className="timeline__container">{timeline()}</div>
      <div className="timeline__line" ref={timelineRef}></div>
    </div>
  );
};
