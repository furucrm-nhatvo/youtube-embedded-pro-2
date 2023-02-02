import quip from "quip-apps-api";
import CommentableRecord from "./CommentableRecord";



export default class YoutubeUrlRecord extends quip.apps.Record {
    static getProperties = () => ({
        url: "string",
        content : quip.apps.RichTextRecord,
        startTime:'number',
        endTime:'number',
        commentUrl : CommentableRecord,
        commentStartTime : CommentableRecord,
        commentEndTime : CommentableRecord,
        commentContent : CommentableRecord
    })
    private listenedChildren: CommentableRecord[] = []

    private childUpdated = () => {
        this.notifyListeners()
    }
    initialize(): void {
        const {commentUrl, commentStartTime, commentEndTime, commentContent} = this.getData()
        const commentList = [commentUrl, commentStartTime, commentEndTime, commentContent]
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
        content: {
            RichText_placeholderText : ""
        },
        startTime: 0,
        endTime: 0,
        commentUrl : {},
        commentStartTime : {},
        commentEndTime : {},
        commentContent : {}
       
    })

    getContent = () => {
        return this.get("content") as quip.apps.RichTextRecord;
    }
    getData() {
        return {
            id: this.getId(),
            url:this.get('url') as string,
            content: this.get("content") as quip.apps.RichTextRecord,
            startTime: this.get('startTime') as number,
            endTime: this.get('endTime') as number,
            commentUrl : this.get('commentUrl') as CommentableRecord,
            commentStartTime : this.get('commentStartTime') as CommentableRecord,
            commentEndTime : this.get('commentEndTime') as CommentableRecord,
            commentContent : this.get('commentContent') as CommentableRecord
        }
    }
}