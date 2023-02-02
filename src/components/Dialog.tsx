import React, { useState } from "react";

export default (props: any) => {
  const closeDialog = () => {
    if (props.onClose) {
      props.onClose();
    }
  };

  const clickOverlay = () => {
    closeDialog();
  };

  const clickYes = () => {
    if (!props.clickYes) {
      closeDialog();
      return;
    }
    props.clickYes();
  };

  const clickNo = () => {
    if (!props.clickNo) {
      closeDialog();
      return;
    }
    props.clickNo();
  };
  return (
    <>
      {props.isShow && (
        <div className="overlay" onClick={clickOverlay}>
          <div className="dialog">
            <div className="dialog__title">{props.title || "Dialog title"}</div>
            <div className="dialog__message">
              {props.message || "Dialog message"}
            </div>
            <div className="dialog__action">
              <button onClick={clickNo}>{props.noText || "No"}</button>
              <button onClick={clickYes}>{props.yesText || "Yes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
