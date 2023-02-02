import quip from "quip-apps-api";

import MyRecord,{MyRecordProps} from "./MyRecord"
import YoutubeUrlRecord from "./YoutubeUrlRecord";
export interface AppData {
    embedUrl: string,
    shareUrl: string,
    vid: string,
    start: string,
    readonly: boolean,
    // pins: PinsData[],
    // cards: DraggableCardData[]
    myRecords: MyRecord[],
    height: number,
    showTimeline: boolean,
    showAnalysis: boolean,
    
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "example";

    static getProperties() {
        return {
            embedUrl: "string",
            shareUrl: "string",
            vid: "string",
            start: "string",
            readonly: "boolean",
            myRecords: quip.apps.RecordList.Type(MyRecord),
            height: "number",
            textRecord: quip.apps.RichTextRecord,
            showTimeline: "boolean",
            showAnalysis: "boolean",
            playCount:'object',
            playbackCountingCycle:'string',
            documentId:'string',
            subdomains: 'object', // name: cacheExpired
            copied:'boolean',
            allowAccess:'boolean',
            errorMessage:'array',
            commentHighlight:'boolean',
            youtubeUrlRecords: quip.apps.RecordList.Type(YoutubeUrlRecord)
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        return {
            myRecords: [],
            youtubeUrlRecords: [],
            cards: [],
            readonly: false,
            height: 0,
            showTimeline: false,
            showAnalysis: false,
            playCount:{},
            playbackCountingCycle: '24h',
            subdomains:{},
            copied:false,
            allowAccess:true,
            commentHighlight:false
        };
    }

    getMyRecords = () => this.get("myRecords") as quip.apps.RecordList<MyRecord>
    getYoutubeUrlRecords = ()=>this.get('youtubeUrlRecords') as quip.apps.RecordList<YoutubeUrlRecord>
    getData(): AppData {
        // const cards = this.cards().getRecords().map(card => card.getData()) as DraggableCardData[]
        return {
            embedUrl : this.get("embedUrl"),
            shareUrl : this.get("shareUrl"),
            vid : this.get("vid"),
            start : this.get("start"),
            // pins : this.pins().getRecords().map((pins : any) => pins.getData()) as PinsData[],
            myRecords: this.getMyRecords().getRecords() as MyRecord[],
            readonly: this.get("readonly"),
            // cards
            height: this.get("height"),
            showTimeline: this.get("showTimeline") as boolean,
            showAnalysis: this.get("showAnalysis") as boolean,
        }
    }
    private listenedChildren: any[] = []

    private childUpdated = () => {
        this.notifyListeners()
    }
    initialize(): void {
        const updateChildListeners = () => {
            // First, clear out our existing listeners to avoid leaks
            this.listenedChildren.forEach(child => {
                child.unlisten(this.childUpdated)
            })
            // clear out our listeners so it'll be accurate
            this.listenedChildren = []
            // then add new listeners for all our current children
            this.getMyRecords().getRecords().forEach(child => {
                child.listen(this.childUpdated)
                // track all the children we're listening to so we can
                // unlisten to them when this list changes
                this.listenedChildren.push(child)
            })
            this.getYoutubeUrlRecords().getRecords().forEach(child => {
                child.listen(this.childUpdated)
                // track all the children we're listening to so we can
                // unlisten to them when this list changes
                this.listenedChildren.push(child)
            })
        }
        // Add a listener to the list itself which will make sure we listen
        // to all children
        this.getMyRecords().listen(updateChildListeners)
        this.getYoutubeUrlRecords().listen(updateChildListeners)
        // invoke it so we initialize with listeners
        updateChildListeners()
    }
    getActions() {
        return {};
    }
}
