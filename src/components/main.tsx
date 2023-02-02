import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import quip from "quip-apps-api";
import React, { Component } from "react";
import { AppData, RootEntity } from "../model/root";
import { timeStringToSeconds } from "../utils";
import YoutubeEmbed from "../YoutubeEmbed";
import YoutubeEmbedMobile from "../YoutubeEmbedMobile";
import CommentHighlight from "./CommentHighlight";
import DialogWrapper from "./DialogWrapper";

const shortnerUrl: any = 'https://youtu.be';
const queryParamKeywordStart: any = 't';
const queryParamKeywordVid: any = 'v';
const urlEmbed = 'https://www.youtube.com/embed/';
interface MainProps {
    rootRecord: RootEntity;
    isCreation: boolean;
    creationUrl?: string;
}

interface MainState {
    data: AppData;
    embedUrl: string;
    shareUrl: string;
    vid: string | null;
    start: string | null;
    fullWidth: number;
    readonly: boolean;
    isImportDialogOpen: boolean;
    importList: string;
    allowAccess: boolean;
    isLoading:boolean;
    errorMessage:any;
}
export default class Main extends Component<MainProps, MainState> {

    constructor(props: MainProps) {
        super(props);
        const { rootRecord } = props;
        const data = rootRecord.getData();
        this.state = {
            data,
            shareUrl: rootRecord.get("shareUrl"),
            embedUrl: rootRecord.get("embedUrl"),
            vid: rootRecord.get("vid"),
            start: rootRecord.get("start"),
            fullWidth: quip.apps.getContainerWidth(),
            readonly: this.props.rootRecord?.get("readonly") || false,
            isImportDialogOpen: false,
            importList: '',
            allowAccess: false,
            isLoading:true,
            errorMessage: rootRecord.get('errorMessage')
        };
    }
    private setRecord(key: string, value: any) {
        const { rootRecord } = this.props;
        rootRecord.set(key, value)
    }
    private clearMyRecords() {
        const { rootRecord } = this.props;
        if (rootRecord?.getMyRecords()) {
            const records: any = rootRecord.getMyRecords()
                ?.getRecords();
            records?.forEach((item: any) => {
                rootRecord.getMyRecords().remove(item)
            })
        }
    }
    private getURL(value: string): any {
        try {
            return new URL(value);
        } catch {
            return {};
        }
    }
    private setEmbededUrl(value: string) {
        if (!value) {
            this.setRecord("embedUrl", "");
            this.setRecord("shareUrl", "");
            this.setRecord("vid", "");
            this.setRecord("start", "");
            // Clear records
            // this.clearMyRecords();
            this.setState({
                embedUrl: "",
                shareUrl: "",
                vid: "",
                start: ""
            });
            return value;
        }

        const url = this.getURL(value);
        let vid, start: any = "";
        let params = new URLSearchParams(url.search);

        let embedUrl: any = urlEmbed;
        let shareUrl = "";
        // video id
        if (url.origin === shortnerUrl && url.pathname !== '/') {
            this.setRecord("vid", url.pathname.replace('/', ''));
            embedUrl = embedUrl + url.pathname.replace('/', '');
            vid = url.pathname.replace('/', '');
        } else if (params.has(queryParamKeywordVid)) {
            this.setRecord("vid", params.get(queryParamKeywordVid));
            embedUrl = embedUrl + params.get(queryParamKeywordVid);
            vid = params.get(queryParamKeywordVid)
        } else {
            this.setRecord("embedUrl", "");
            this.setRecord("shareUrl", value);
            this.setRecord("vid", "");
            this.setRecord("start", "");
            // Clear records
            // this.clearMyRecords();
            this.setState({
                embedUrl: "",
                shareUrl: value,
                vid: "",
                start: ""
            });
            return value;
        }

        // sta rt position
        if (params.has(queryParamKeywordStart)) {
            this.setRecord("start", params.get(queryParamKeywordStart));
            embedUrl = embedUrl + "?t=" + params.get(queryParamKeywordStart);
            start = params.get(queryParamKeywordStart)
        } else {
            this.setRecord("start", "");
        }

        shareUrl = embedUrl.replace(urlEmbed, shortnerUrl + "/");

        this.setRecord("embedUrl", embedUrl);
        this.setRecord("shareUrl", shareUrl);
        this.setState({
            embedUrl: embedUrl,
            shareUrl: shareUrl,
            vid: vid,
            start: start,
        })
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        const youtubeUrlRecordList = rootRecord.getYoutubeUrlRecords();
        youtubeUrlRecordList.add({
          url:shareUrl
        })
        return embedUrl;
    }
    validateYouTubeUrl() {
        if (this.state.embedUrl != null && this.state.embedUrl != '') {
            const url = this.state.embedUrl;
            if (url != undefined || url != '') {
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
                var match = url.match(regExp);
                if (match && match[2].length == 11) {
                    return true
                }
                else {
                    return false;
                }
            }
        } else {
            return false
        }

    }
    clickToCopy() {
        var copyText: any = document.querySelector("#input");
        copyText.select();
        document.execCommand("copy");
    }
    componentDidMount() {
        const { rootRecord } = this.props;
        const documentId = quip.apps.getThreadId()
        if (!documentId) return
        const documentIdInRoot = rootRecord.get('documentId')
        if (!documentIdInRoot) {
            rootRecord.set('documentId', documentId)
            this.setState({
                allowAccess: true,
                isLoading:false
            })
            return
        }
        if (documentId !== documentIdInRoot) {
            if(rootRecord.get('allowAccess') === false){
                this.setState({
                    isLoading:false
                })
                return
            }
            // copy document
            this.checkSubdomain().then(result => {
                this.setState({
                    isLoading:false
                })
                if (!result) return
                rootRecord.set('playCount', {})
                rootRecord.set('documentId', documentId)
            })
            return
        }
        this.setState({
            allowAccess: true,
            isLoading:false
        })
        window.addEventListener('keyup',(e)=>{
            if(e.key === "Escape") {
                rootRecord.set('commentHighlight', false)
            }
        })
        rootRecord.listen(this.updateUrl)
    }
    componentWillUnmount(){
        this.props.rootRecord.unlisten(this.updateUrl)
    }
    updateUrl = (record:any)=>{
        if(!record.get('embedUrl')){
            this.setEmbededUrl('')
        }
    }
    checkSubdomain = async () => {
        // kiem tra trong root có subdomain hien tai khong
        const regex = /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i
        const currentSubdomain = (document.referrer || window.location.ancestorOrigins[0]).match(regex)?.[1] || ''
        // gọi lại api để check
        const {allowAccess, error} = await this.fetchLicense(currentSubdomain)
        if (allowAccess) {
            this.setState({
                allowAccess: true
            })
            return true
        }
        if(error){
            this.props.rootRecord.set('errorMessage', error)
            this.setState({
                errorMessage:error
            })
            
        }
        this.props.rootRecord.set('allowAccess', false)
        return false
    }
    fetchLicense = async (subdomain:string) =>{
        try {
            const response = await fetch(`https://asia-northeast1-rqa-backend.cloudfunctions.net/licenseManager-checkLicense?subdomain=${subdomain}&app=${'res-yep'}`)
            return await response.json()
        } catch(e){
            return {}
        }
    }
    openImportDialog = () => {
        this.setState({
            isImportDialogOpen: true
        })
    }
    closeImportDialog = () => {
        this.setState({
            isImportDialogOpen: false
        })
    }
    importPinList = () => {
        const regex = /(\d{2}:){1,2}\d{2}/gm
        this.state.importList.split('\n').forEach(line => {
            const timeline = line.match(regex)?.[0]
            if (!timeline) return
            const textContent = line.split(timeline)[1]
            const currentTime = timeStringToSeconds(timeline)
            const rootRecord = quip.apps.getRootRecord() as RootEntity;
            const myRecords = rootRecord.getMyRecords();
            // if(!rootRecord.get("readonly")){
            //   this.props.setReadOnly(true)
            // }
            const myRecord: any = { title: "Title " + Math.random(), time: currentTime };
            // Set pin user
            const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
            if (currentUser) {
                myRecord.userPin = {
                    id: currentUser.getId(),
                    name: currentUser.getName(),
                    actionTimestamp: Date.now()
                }
            }
            const newRecord = myRecords.add(myRecord);
            setTimeout(() => {
                console.log(textContent)
                newRecord.getContent().replaceContent(textContent)
            }, 0)
            this.setState({
                importList:''
            })
            this.closeImportDialog()
        })
    }
    handleImportListChange = (evt: any) => {
        this.setState({
            importList: evt.target.value
        })
    }
    render() {
        let url = "";
        if (this.state.vid) url = shortnerUrl + "/" + this.state.vid;
        if (this.state.start) url = url + "?t=" + this.state.start;
        if(this.state.isLoading) {
            return <div className="loader"></div>
        }
        if (!this.state.allowAccess) {
            if(this.state.errorMessage){
                return this.state.errorMessage.map((line:any)=>{
                    switch(line.decoration){
                        case 'bold':
                            return <p><b>{line.text}</b></p>
                        case 'link':
                            return <div onClick={()=>quip.apps.openLink(line.url)} style={{color:'#116ac3', cursor:'pointer', textDecoration:'underline'}}>{line.text}</div>
                        case 'italic':
                            return <p><i>{line.text}</i></p>
                        case 'normal':
                            return <p>{line.text}</p>
                        default:
                            return <p>{line.text}</p>
                    }
                    
                })
            }
            return <div>You don't have permission to access this component</div>
        }
        return (
            <>
                
                <div className={"root"} style={{ display: "block", overflow: 'hidden', padding: quip.apps.isMobile() ? '0 10px 10px 0' : '0', }}>
                    <CommentHighlight></CommentHighlight>
                    {this.state.isImportDialogOpen
                        && <DialogWrapper>
                            <div style={{ width: '55%', height: '70%', background: 'white', padding: '10px', border: '2px solid #197e6b' }}>
                                <textarea
                                    style={{ width: '100%', height: '89%', border: '1px solid grey', borderRadius: '0' }}
                                    value={this.state.importList}
                                    onChange={this.handleImportListChange}
                                >
                                </textarea>
                                <div style={{ height: '10px' }}></div>
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="btn btn--border" onClick={this.closeImportDialog}>Cancel</div>
                                        <div className="btn btn--filled" onClick={this.importPinList}>Import to Pin Timeline</div>
                                    </div>
                                </div>
                            </div>
                        </DialogWrapper>}
                    <div className="input-group" style={{ width: '100%' }}>
                        <input
                            className="form-control"
                            type="text"
                            id="input"
                            value={this.state.shareUrl}
                            placeholder="YouTubeのURLを入力"
                            onChange={(e) => this.setEmbededUrl(e.target.value)}
                            readOnly={this.state.readonly}

                        />
                        {
                            this.state.embedUrl != null && this.state.embedUrl != '' && this.validateYouTubeUrl() &&
                            <div className="input-group-text" style={{ cursor: "pointer" }} onClick={() => this.clickToCopy()}>
                                <FontAwesomeIcon icon={faClipboard} />
                            </div>
                        }
                    </div>
                    {
                        this.state.embedUrl != null && this.state.embedUrl != '' && this.validateYouTubeUrl() &&
                        <div style={{ position: "relative" }}>
                            <React.Fragment key={this.state.vid}>
                                {quip.apps.isMobile() ?
                                    (
                                        <YoutubeEmbedMobile vid={this.state.vid} fullWidth={this.state.fullWidth} videoUrl={this.state.shareUrl} />
                                    ) : (
                                        <YoutubeEmbed
                                            setReadOnly={(status: boolean) => this.setState({ readonly: status })}
                                            urlEmbed={urlEmbed}
                                            shareUrl={this.state.shareUrl}
                                            vid={this.state.vid}
                                            start={this.state.start}
                                            fullWidth={this.state.fullWidth}
                                            isMobile={quip.apps.isMobile()}
                                            rootRecord={this.props.rootRecord}
                                            openImportDialog={this.openImportDialog}
                                        />
                                    )}
                            </React.Fragment>
                        </div>
                    }
                </div>
            </>
        );
    }
}
