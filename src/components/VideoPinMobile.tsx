import React, { useMemo, useState } from "react";
import quip from "quip-apps-api";
import { RootEntity } from "../model/root";
export default (props: any) => {
  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time - h * 3600) / 60);
    const s = Math.floor(time - h * 3600 - m * 60);
    let _h: string, _m: string, _s: string;
    _h = h < 10 ? "0" + h : h.toString();
    _m = m < 10 ? "0" + m : m.toString();
    _s = s < 10 ? "0" + s : s.toString();
    return _h + ":" + _m + ":" + _s;
  };

  const playVideo = (time: number) => {
    const url = props.videoUrl + "?t=" + Math.round(time) + "s";
    quip.apps.openLink(url);
  };

  const displayListRecord = useMemo(() => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    return (
      <div className="mobile-video-pin__container">
        {rootRecord
          .getMyRecords()
          .getRecords()
          .sort((r1: any, r2: any) => r1.get("time") - r2.get("time"))
          .map((item: any) => {
            const { time, content, comment } = item.getData();
            return (
              <div className="mobile-video-pin__item">
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    border: "1px solid #dcdcdc",
                  }}
                  ref={c => comment.setDom(c)}
                >
                  <quip.apps.ui.CommentsTrigger
                    record={comment}
                    showEmpty={true}
                    className="ml-5"
                  />
                  <div
                    className="mobile-video-pin__item-time"
                    onClick={() => playVideo(time)}
                  >
                    {formatTime(time)}
                  </div>
                </div>
                <div className="mobile-video-pin__item-content">
                  <quip.apps.ui.RichTextBox
                    record={content}
                    allowHeadings={true}
                    allowSpecialTextStyles={true}
                  />
                </div>
              </div>
            );
          })}
      </div>
    );
  }, []);

  return (
    <>
      <div className={"list-pin"}>{displayListRecord}</div>
    </>
  );
};
