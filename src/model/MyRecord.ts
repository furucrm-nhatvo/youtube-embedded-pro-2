import quip from "quip-apps-api";
import CommentableRecord from "./CommentableRecord";
import MyUser from "./MyUser";

export interface MyRecordProps {
    title?: string;
    time : number;
    disabled: boolean;
    content: quip.apps.RichTextRecord;
    likes: MyUser[];
    userPin: MyUser;
    userUpdate: MyUser;
}

export default class MyRecord extends quip.apps.Record {
    static getProperties = () => ({
        title: "string",
        content : quip.apps.RichTextRecord,
        comment : CommentableRecord,
        comment2 : CommentableRecord,
        time : "number",
        disabled: "boolean",
        likes: "array",
        userPin: "object",
        userUpdate: "object",
        clickedPinList: "array",
        vid:'string'
    })
    private listenedChildren: CommentableRecord[] = []

    private childUpdated = () => {
        this.notifyListeners()
    }
    initialize(): void {
        const {comment, comment2} = this.getData()
        const commentList = [comment,comment2]
        // First, clear out our existing listeners to avoid leaks
        this.listenedChildren.forEach(child => {
            child.unlistenToComments(this.childUpdated)
        })
        // clear out our listeners so it'll be accurate
        this.listenedChildren = []
        // then add new listeners for all our current children
        commentList.forEach(child => {
            child.listenToComments(this.childUpdated)
            // track all the children we're listening to so we can
            // unlisten to them when this list changes
            this.listenedChildren.push(child)
        })
    }
    static getDefaultProperties = () => ({
        disabled: false,
        time: 0,
        content: {
            RichText_placeholderText : ""
        },
        comment: {},
        comment2: {},
        likes: [],
        userPin: undefined,
        userUpdate: undefined,
        clickedPinList: [],
    })
    getCommentableRecord = () => {
        return this.get("comment") as CommentableRecord;
    }
    getContent = () => {
        return this.get("content") as quip.apps.RichTextRecord;
    }
    getData() {
        return {
            id: this.getId(),
            title: this.get("title") as string,
            disabled: this.get("disabled") as boolean,
            time : this.get("time") as number,
            content: this.get("content") as quip.apps.RichTextRecord,
            comment: this.getCommentableRecord(),
            comment2: this.get('comment2') as CommentableRecord,
            likes: this.get("likes") as MyUser[],
            userPin: this.get("userPin") as MyUser,
            userUpdate: this.get("userUpdate") as MyUser,
            clickedPinList: this.get("clickedPinList") as MyUser[],
        }
    }
}