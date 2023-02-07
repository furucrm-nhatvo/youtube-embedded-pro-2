import React, { useRef, useState, useEffect } from "react";
import quip from "quip-apps-api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRemove,
  faThumbsUp,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import Input from "./Input";
import ReactTooltip from "react-tooltip";
import ClockIcon from "../components/ClockIcon";
import ClockRotateRightIcon from "../components/ClockRotateRightIcon";
import moment from "moment";
import { RootEntity } from "../model/root";
export default React.memo(React.forwardRef((props: any, ref: any) => {
  const {
    id,
    time,
    content,
    goToTime,
    updateTime,
    removeItem,
    comment,
    comment2,
    likes,
    handleLike,
    userPin,
    userUpdate,
    handleUserUpdate,
    clickedPinList,
  } = props;
  const [isEdit, setIsEdit] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const [clickedPinTotal, setClickedPinTotal] = useState<number>(0);
  const [isHighlighted, setHighlighted] = useState(quip.apps.getRootRecord().get('commentHighlight'))
  useEffect(() => {
    quip.apps.getRootRecord().listen(updateHighlight)
    return () => {
      quip.apps.getRootRecord().unlisten(updateHighlight)
    }
  }, [])
  const updateHighlight = (rootRecord: quip.apps.RootRecord) => {
    setHighlighted(rootRecord.get('commentHighlight'))
  }
  useEffect(() => {
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    const isLiked: boolean =
      !!currentUser && !!likes.find((u: any) => u.id === currentUser.getId());
    setIsLiked(isLiked);
  }, [JSON.stringify(likes)]);

  useEffect(() => {
    const clickedPinTotal = clickedPinList
      .map((e: any) => e.clickedPinCount)
      .reduce((a: number, b: number) => a + b, 0);
    setClickedPinTotal(clickedPinTotal);
  }, [JSON.stringify(clickedPinList)]);

  const hourInputRef = useRef();
  const minuteInputRef = useRef();
  const secondInputRef = useRef();

  const hour = Math.floor(time / 3600);
  const minute = Math.floor((time - hour * 3600) / 60);
  const second = Math.floor(time - hour * 3600 - minute * 60);

  const formatTime = (h: number, m: number, s: number) => {
    let _h: string, _m: string, _s: string;
    _h = h < 10 ? "0" + h : h.toString();
    _m = m < 10 ? "0" + m : m.toString();
    _s = s < 10 ? "0" + s : s.toString();
    return _h + ":" + _m + ":" + _s;
  };

  const onClickEditBtn = (event: any) => {
    event.stopPropagation();
    setIsEdit(true);
    const timeout = setTimeout(() => {
      if (secondInputRef.current) {
        (secondInputRef.current as any).focus();
      }
      clearTimeout(timeout);
    }, 100);
  };

  const onClickSaveBtn = (event: any) => {
    event.stopPropagation();
    setIsEdit(false);
    const hourInput: any = hourInputRef.current;
    const minuteInput: any = minuteInputRef.current;
    const secondInput: any = secondInputRef.current;
    const newTime: number =
      Number(hourInput.value) * 60 * 60 +
      Number(minuteInput.value) * 60 +
      Number(secondInput.value) +
      Number("0." + (Number((time + "").split(".")[1]) || 0));
    if (newTime != time) {
      updateTime(id, newTime);
    }
  };

  const onKeyPressTimeInput = (evt: any) => {
    if (evt.keyCode === 13 || evt.key === "Enter") {
      onClickSaveBtn(evt);
    }
  };

  const onClickRemoveBtn = () => {
    removeItem(id);
  };

  const onClickLikeBtn = () => {
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    if (currentUser) {
      handleLike(id, currentUser);
    }
  };

  const onChangeRichTextBox = () => {
    setIsEditingContent(false);
    handleUserUpdate(id);
  };

  const generateTooltipContent = () => {
    return (
      <div style={{ maxHeight: 150, overflow: "auto" }}>
        {likes.map((e: any) => {
          const user = quip.apps.getUserById(e.id);
          return (
            <>
              <div className="liked-user__content">
                <div>
                  {user && (
                    <quip.apps.ui.ProfilePicture
                      user={user}
                      size={24}
                      round={true}
                    />
                  )}
                </div>
                <div
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {e.name}
                </div>
              </div>
            </>
          );
        })}
      </div>
    );
  };
  const generateUserPinTooltipContent = () => {
    const user = quip.apps.getUserById(userPin?.id);
    return (
      user && (
        <div>
          <div className="tooltip__time">
            {formatDate(userPin.actionTimestamp)}
          </div>
          <div className="tooltip__content">
            <quip.apps.ui.ProfilePicture user={user} size={24} round={true} />
            <div className="ml-5">{userPin.name}</div>
          </div>
        </div>
      )
    );
  };
  const generateUserUpdateTooltipContent = () => {
    const user = quip.apps.getUserById(userUpdate?.id);
    return (
      user && (
        <div>
          <div className="tooltip__time">
            {formatDate(userUpdate.actionTimestamp)}
          </div>
          <div className="tooltip__content">
            <quip.apps.ui.ProfilePicture user={user} size={24} round={true} />
            <div className="ml-5">{userUpdate.name}</div>
          </div>
        </div>
      )
    );
  };
  const generateClickedPinTooltipContent = () => {
    return (
      <div style={{ maxHeight: 150, overflow: "auto" }}>
        {clickedPinList.map((e: any) => {
          const user = quip.apps.getUserById(e.id);
          return (
            <>
              <div className="clicked-pin__content">
                <div>
                  {user && (
                    <quip.apps.ui.ProfilePicture
                      user={user}
                      size={24}
                      round={true}
                    />
                  )}
                </div>
                <div
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {e.name}
                </div>
                <div className="clicked-pin__number">{e.clickedPinCount}</div>
              </div>
            </>
          );
        })}
      </div>
    );
  };
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    return moment(timestamp).format("YYYY/MM/DD HH:mm:ss");
  };
  return (
    <>
      <div className="li-item" ref={ref} style={{position:'relative'}}>
        {props.disabled && <div style={{position:'absolute', width:'100%', height:'100%', zIndex:'2', background:'#0000003d', top:'0', left:'0'}}></div>}
        <div
          className="li-item-time"

          data-tip
          data-for={id + "-pin"}
          style={{ position: 'relative' }}
        >
          <div className={`comment-frame ${isHighlighted ? 'add-comment' : ''}`} onClick={(event: any) => {
            if (isHighlighted) {
              (comment.getDom()?.firstChild as HTMLElement)?.click()
              quip.apps.getRootRecord().set('commentHighlight', false)
            }
          }}></div>
          <div className={comment.getCommentCount() ? 'has-comment' : ''} onClick={(event: any) => {
            if (comment.getCommentCount()) {
              (comment.getDom()?.firstChild as HTMLElement)?.click();
            }

          }}></div>
          <span
            className='custom-comment'
            ref={c => comment.setDom(c!)}
            style={{ position: 'absolute', bottom: '5px', right: '5px', cursor: 'pointer', pointerEvents: 'none' }}
          >
            <quip.apps.ui.CommentsTrigger
              record={comment}
              showEmpty={true}
              className="item-comment"
            />
          </span>
          {!isEdit ? (
            <>
            <button className="item-time__btn" onClick={onClickEditBtn}>
                <ClockRotateRightIcon width="15" height="15" />
              </button>
              <div className="item-time__text" style={{color:props.disabled?'grey':'#197e6b'}} onClick={() => {
                if (isHighlighted) {
                  return
                }
                goToTime(id, time)
              }}>
                {formatTime(hour, minute, second)}
              </div>
              
            </>
          ) : (
            <>
            <button className="item-time__btn" onClick={onClickSaveBtn}>
                <ClockIcon width="15" height="15" />
              </button>
              <div className="item-time__text">
                <Input
                  className="item-time__input"
                  type="number"
                  min="0"
                  value={hour}
                  ref={hourInputRef}
                  onKeyPress={onKeyPressTimeInput}
                />
                :
                <Input
                  className="item-time__input"
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  ref={minuteInputRef}
                  onKeyPress={onKeyPressTimeInput}
                />
                :
                <Input
                  className="item-time__input"
                  type="number"
                  min="0"
                  max="59"
                  value={second}
                  ref={secondInputRef}
                  onKeyPress={onKeyPressTimeInput}
                />
              </div>
              
            </>
          )}
        </div>

        <div className="li-item-like">
          <div className="like-container">
            <div className="clicked-pin-container__item">
              <div className="play-icon">
                <FontAwesomeIcon icon={faPlay} />
              </div>
              <div
                data-tip
                data-for={id + "-clicked-pin"}
                data-event="click focus"
                className={
                  `cursor--pointer like-number` +
                  (clickedPinTotal ? "" : " zero")
                }
              >
                {clickedPinTotal < 100 ? clickedPinTotal : "99+"}
              </div>
            </div>
            <div className="like-container__item">
              <button
                className={"btn-like " + (isLiked ? "liked" : "")}
                onClick={onClickLikeBtn}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </button>
              <div
                data-tip
                data-for={id}
                data-event="click focus"
                className={
                  `cursor--pointer like-number` + (likes.length ? "" : " zero")
                }
              >
                {likes.length < 100 ? likes.length : "99+"}
              </div>
            </div>
          </div>
        </div>

        <div className="li-item-content">
          <div style={{ flex: 32 }} data-tip data-for={id + "-update"}>
          <div className={`comment-frame ${isHighlighted ? 'add-comment' : ''}`} onClick={(event: any) => {
            if (isHighlighted) {
              (comment2.getDom()?.firstChild as HTMLElement)?.click()
              quip.apps.getRootRecord().set('commentHighlight', false)
            }
          }}></div>
          <div className={comment2.getCommentCount() ? 'has-comment' : ''} onClick={(event: any) => {
            if (comment2.getCommentCount()) {
              (comment2.getDom()?.firstChild as HTMLElement)?.click();
            }

          }}></div>
          <span
            className='custom-comment'
            ref={c => comment2.setDom(c!)}
            style={{ position: 'absolute', bottom: '5px', right: '5px', cursor: 'pointer', pointerEvents: 'none' }}
          >
            <quip.apps.ui.CommentsTrigger
              record={comment2}
              showEmpty={true}
              className="item-comment"
            />
          </span>
            <quip.apps.ui.RichTextBox
              record={content}
              allowHeadings={true}
              allowSpecialTextStyles={true}
              onBlur={onChangeRichTextBox}
              handleKeyEvent={() => {
                setIsEditingContent(true);
              }}
            />
          </div>
          <div className="btn-remove" onClick={onClickRemoveBtn}>
            <FontAwesomeIcon icon={faRemove} />
          </div>
        </div>
      </div>
      {!!likes.length && (
        <ReactTooltip
          id={id}
          place="right"
          type="dark"
          effect="solid"
          globalEventOff="click"
          scrollHide={false}
          clickable={true}
        >
          {generateTooltipContent()}
        </ReactTooltip>
      )}
      {/* User Pin Tooltip */}
      {/* {userPin && (
        <ReactTooltip
          id={id + "-pin"}
          place="right"
          type="dark"
          effect="solid"
          globalEventOff="click"
          className="custom-tooltip"
        >
          {generateUserPinTooltipContent()}
        </ReactTooltip>
      )} */}
      {/* User Update Tooltip */}
      {userUpdate && !isEditingContent && (
        <ReactTooltip
          id={id + "-update"}
          place="right"
          type="dark"
          effect="float"
          globalEventOff="click"
          className="custom-tooltip"
          delayShow={1000}
        >
          {generateUserUpdateTooltipContent()}
        </ReactTooltip>
      )}
      {/* Clicked Pin List Tooltip */}
      {!!clickedPinList.length && (
        <ReactTooltip
          id={id + "-clicked-pin"}
          place="right"
          type="dark"
          effect="solid"
          globalEventOff="click"
          scrollHide={false}
          clickable={true}
        >
          {generateClickedPinTooltipContent()}
        </ReactTooltip>
      )}
    </>
  );
}));
