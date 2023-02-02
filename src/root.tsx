import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import {RootEntity} from "./model/root";
import MyRecord from "./model/MyRecord";
import MyUser from "./model/MyUser";
import CommentableRecord from "./model/CommentableRecord";
import { updateToolbar } from "./menus";
import YoutubeUrlRecord from "./model/YoutubeUrlRecord";

quip.apps.registerClass(MyRecord, "my-record");
quip.apps.registerClass(YoutubeUrlRecord, "yt-record");
quip.apps.registerClass(MyUser, "my-user");
quip.apps.registerClass(RootEntity, RootEntity.ID);
quip.apps.registerClass(CommentableRecord, "commentable-record")

quip.apps.initialize({
    initializationCallback: function (
        rootNode: Element,
        params: {
            isCreation: boolean;
            creationUrl?: string;
        }
    ) {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        ReactDOM.render(
            <Main
                rootRecord={rootRecord}
                isCreation={params.isCreation}
                creationUrl={params.creationUrl}
            />,
            rootNode
        );
        updateToolbar();
    },
});
