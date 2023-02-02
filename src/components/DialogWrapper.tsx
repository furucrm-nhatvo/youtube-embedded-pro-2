import quip from 'quip-apps-api';
import React, { useEffect, useRef, useState } from 'react'

export default function DialogWrapper(props: any) {
    const containerRef = useRef(null);
    const dimensions = quip.apps.getCurrentDimensions() as any;
    const style: any = {
        position: "absolute",
        width: dimensions.width,
        height: dimensions.height,
        display: "flex",
        flexDirection:'column',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 302,
    };
    useEffect(() => {
        if(!props.isFullScreen) quip.apps.showBackdrop(props.onDismiss);
        if (containerRef.current) {
            quip.apps.addDetachedNode(containerRef.current);
        }
        return () => {
            if(!props.isFullScreen) quip.apps.dismissBackdrop();
            if (containerRef.current) {
                quip.apps.removeDetachedNode(containerRef.current);
            }
        }
    }, [])
    return <div ref={containerRef} style={style}>
        {props.children}
    </div>
}