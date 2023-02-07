import moment from "moment";
import quip from "quip-apps-api";
import React, { Component, createRef } from "react";
import Dialog from "./components/Dialog";
import VideoPin from "./components/VideoPin";
import MyRecord from "./model/MyRecord";
import { RootEntity } from "./model/root";
import { parseYoutubeVideoId } from "./utils";

export default class extends Component<any,any> {
  YT : any
  myRecords : any
  resizersRef: any
  private interval: any;
  constructor(props : any) {
    super(props);
    this.state = {
      displayIframe : false,
      videoState : -1,
      listRecords : [],
      original_height: "auto",
      height : "auto",
      original_y : 0,
      original_mouse_y: 0,
      duration: 0,
      showConfirmDeleteDialog: false,
      idToDelete: "",
    }
    this.resizersRef = createRef();
    this.interval = undefined;
  }

  componentDidMount(){
    let w : any = window;
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    this.myRecords = myRecords
    if((window as any).YT == null){
      this.setState({displayIframe : true})
    }else{
      let myInterval = setInterval(()=>{
        if(w.YT.Player != null){
          clearInterval(myInterval);
          this.loadVideo();
        }
      }, 100);
    }
    if(myRecords?.getRecords() != null){
      this.setState({
        listRecords : myRecords.getRecords()
      })
    }
    // Set height
    this.setState({
      height: rootRecord.getData().height === 0
        ? "auto"
        : rootRecord.getData().height
    })
    this.myRecords.listen(this.updateRecordList)
  }
  componentWillUnmount(): void {
      this.myRecords.unlisten(this.updateRecordList)
  }
  updateRecordList = (recordList:quip.apps.RecordList<MyRecord>)=>{
    this.setState({listRecords : recordList.getRecords()})
  }
  loadVideo = () => {
    let w : any = window;
    const { vid, start,isMobile,fullWidth,urlEmbed,shareUrl } = this.props;
    const YT = new w.YT.Player('display-youtube', {
      height: isMobile ? (fullWidth*70)/100 :"480",
      width: "100%",
      videoId: vid,
      playerVars: {
        'playsinline': 1,
        'autoplay': 0
      },
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange,
      }
    })
    this.YT = YT
  }
  // shouldComponentUpdate(newProps : any,newState : any){

  //   return(
  //     !isEqual(this.state,newState) ||
  //     !isEqual(this.props.vid,newProps.vid)
  //   )
  // }
  // componentDidUpdate(newProps : any){
  //   if(!isEqual(this.props.vid,newProps.vid)){
  //     this.loadVideo()
  //   }
  // }
  onPlayerReady = (event: any) => {
    this.setState({ duration: event.target.getDuration() });
  }
  onPlayerStateChange = (event : any) => {
    this.setState({videoState : event.data})
    if (event.data === 1) {
      this.handlePlayCount()
    }
    if (event.data === 0) {
      const rootRecord = quip.apps.getRootRecord() as RootEntity;
      const playCount = rootRecord.get('playCount');
      const playbackCountingCycle: string = rootRecord.get('playbackCountingCycle');
      if (playCount.data && playbackCountingCycle === 'playtime') {
        const newData = JSON.parse(JSON.stringify(playCount.data));
        Object.keys(newData).forEach((userId: string) => {
          newData[userId] = {
            ...newData[userId],
            canCount: true,
          }
        });
        rootRecord.set('playCount', { ...playCount, data:newData });
    }
    }
  }
  handlePlayCount=()=>{
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    let playCountObj=rootRecord.get('playCount') as any
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    const userId=currentUser?.getId()
    if (currentUser && userId) {
      let shouldUpdateData = false;
      let playCountObjData = playCountObj['data'] || {};
      const currentUserData = playCountObjData[userId];
      let newCount = null;
      let canCount = null;
      if (!currentUserData) {
        newCount = 1;
        canCount = false;
        shouldUpdateData = true;
      } else {
        const countingCycle: number | string = rootRecord.get('playbackCountingCycle') === 'playtime'
          ? 'playtime' : Number(rootRecord.get('playbackCountingCycle').split('h')[0]);
        newCount = currentUserData.count;
        canCount = currentUserData.canCount;
        if (countingCycle !== "playtime") {
          const lastCountingTime = currentUserData.actionTimestamp;
          const everyOtherDayCondition = countingCycle === 24
            && moment().isBefore(moment(lastCountingTime).add(countingCycle, "h"))
            && !moment().isSame(moment(lastCountingTime), "day");
          if (moment().isSameOrAfter(moment(lastCountingTime).add(countingCycle, "h")) || everyOtherDayCondition) {
            newCount++;
            shouldUpdateData = true;
          };
        } else {
          const lastCountingTime = currentUserData.actionTimestamp;
          if (moment().isSameOrAfter(moment(lastCountingTime).add(this.state.duration, "s"))) {
            currentUserData.canCount=true
          }
          if (currentUserData.canCount) {
            newCount++;
            canCount = false;
            shouldUpdateData = true;
          }
        }
      }
      if (shouldUpdateData) {
        playCountObjData[userId] = {
          ...playCountObjData[userId],
          actionTimestamp: Date.now(),
          count: newCount,
          canCount
        };

        playCountObj['data'] = playCountObjData;
        rootRecord.set('playCount', playCountObj);
      }
    }
  }
  clearItem = () => {
    if(this.myRecords != null && this.myRecords.getRecords() != null){
      this.myRecords.getRecords().map((item : any) =>{
        this.myRecords.remove(item)
        })
    }
  }
  playOrPauseVideo = () => {
    const videoState = this.YT.getPlayerState();
    if (videoState === 1) {
      this.YT.pauseVideo();
    }else{
      this.YT.playVideo();
    }
  }
  pin = () => {
    const {currentTime} = this.YT.playerInfo
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    const currentVideoId = parseYoutubeVideoId(this.YT.getVideoUrl())
    const currentVideoRecord = rootRecord.getYoutubeUrlRecords().getRecords().find(record=>record.get('vid') === currentVideoId)
    if(!currentVideoRecord) return
    // if(!rootRecord.get("readonly")){
    //   this.props.setReadOnly(true)
    // }
    if(myRecords.getRecords().some(record=>record.get('vid') === currentVideoId && Math.floor(record.get('time')) === Math.floor(currentTime))) {
      return
    }
    
    if(currentTime > currentVideoRecord?.get('endTime') || currentTime < currentVideoRecord?.get('startTime')){
      return
    }
    const myRecord: any = { title: "Title " + Math.random(), time: currentTime, vid: currentVideoId};
    // Set pin user
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    if (currentUser) {
      myRecord.userPin = {
        id: currentUser.getId(),
        name: currentUser.getName(),
        actionTimestamp: Date.now()
      }
    }
    const newRecord= myRecords.add(myRecord);
    this.updateRecords();
    return newRecord.getData().id || undefined
  }
  seekTo = (id: string, time : number) => {
    // if (id == null) {
    //   this.YT.seekTo(this.YT.getCurrentTime() + time);
    //   return;
    // }
    // this.YT.seekTo(time);


    // Update clicked pin list
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    // Get record by id
    const record = myRecords.getRecords().find((record: any) => record.getId() === id);
    // Get current user
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    if (record && currentUser) {
      const clickedPinList = record.get("clickedPinList");
      const user = clickedPinList.find((u: any) => u.id === currentUser.getId());
      if (user) {
        user.clickedPinCount = user.clickedPinCount + 1;
      } else {
        clickedPinList.push({
          id: currentUser.getId(),
          name: currentUser.getName(),
          clickedPinCount: 1,
        });
      }
      record.set("clickedPinList", clickedPinList);
      this.forceUpdate();
    }
  }
  updateRecords(){
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    this.setState({listRecords : myRecords.getRecords()})
  }
  updateTime = (id: string, time: number) => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    // Get record by id
    const record = myRecords.getRecords().find((record: any) => record.getId() === id);
    if (record) {
      record.set("time", time);
      this.forceUpdate();
    }
  }
  confirmDelete = (id: string) => {
    this.setState({
      idToDelete: id,
      showConfirmDeleteDialog: true
    })
  }
  removeItem = () => {
    const id = this.state.idToDelete;
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    // Get record by id
    const record = myRecords.getRecords().find((record: any) => record.getId() === id);
    if (record) {
      myRecords.remove(record);
      this.updateRecords();
    }
  }
  onMouseDown = (e: any) => {
    e.preventDefault();
    if (this.resizersRef.current) {
      const wrapper = document.querySelector(".wrapper") as HTMLElement;
      if (wrapper) wrapper.style.height = `${wrapper.getBoundingClientRect().height + 500}px`;
      const container = this.resizersRef.current;
      this.setState({
        original_height: container.offsetHeight,
        original_y: container.getBoundingClientRect().top,
        original_mouse_y: e.pageY,
      }, () => {
        window.addEventListener('mousemove', this.resize)
        window.addEventListener('mouseup', this.stopResize)
      });
    }
  }
  resize = (e: any) => {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.stopResize();
      clearInterval(this.interval);
    }, 200);
    const height = this.state.original_height + (e.pageY - this.state.original_mouse_y);
    this.setState({ height });
  }
  stopResize = () => {
    const wrapper = document.querySelector(".wrapper") as HTMLElement;
    if (wrapper) wrapper.style.height = "auto";
    this.setState({
      original_height : this.state.height,
    }, ()=>{
      const rootRecord = quip.apps.getRootRecord() as RootEntity;
      rootRecord.set("height", this.state.height);
    })
    window.removeEventListener('mousemove', this.resize)
    window.removeEventListener('mouseup', this.stopResize)
  }
  updateHeight = (h: number) => {
    if (this.state.height == "auto") {
      if (h == 0) {
        this.setState({height: 0});
      } else {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        rootRecord.set("height", 50 + h);
        this.setState({height: 50 + h});
      }
    }
  }
  changePlaybackRate = (rate: number) => {
    this.YT.setPlaybackRate(rate);
  }
  handleLike = (id: string, user: quip.apps.User) => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    // Get record by id
    const record = myRecords.getRecords().find((record: any) => record.getId() === id);
    if (record) {
      const likes: any = record.get("likes");
      const likedUserIndex = likes.findIndex((u: any) => u.id === user.getId());
      if (likedUserIndex === -1) {
        likes.push({
          id: user.getId(),
          name: user.getName()
        });
      } else {
        likes.splice(likedUserIndex, 1);
      }
      record.set("likes", likes);
      this.forceUpdate();
    }
  }
  handleUserUpdate = (id: string) => {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    const myRecords = rootRecord.getMyRecords();
    // Get record by id
    const record = myRecords.getRecords().find((record: any) => record.getId() === id);
    if (record) {
      const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
      if (currentUser) {
        const user = {
          id: currentUser.getId(),
          name: currentUser.getName(),
          actionTimestamp: Date.now()
        }
        record.set("userUpdate", user);
        this.forceUpdate();
      }
    }
  }
  render() {
    const { vid, start,isMobile,fullWidth,urlEmbed } = this.props;
    let listRecord = this.state.listRecords || []
    // Sort list record
    if (listRecord.length) {
      listRecord = listRecord.sort(
        (r1: any, r2: any) => r1.get("time") - r2.get("time")
      );
    }
    return (
      <>
        <div className="wrapper">
          <div id="display-youtube" className="video-responsive">
            {this.state.displayIframe && (
                <iframe
                  width="100%"
                  height={isMobile ? (fullWidth*70)/100 :"480"}
                  src={urlEmbed+`${vid}?start=${start}`}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  allow-presentation
                  sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                  title="Embedded youtube"
                />
              )
            }
          </div>
          {!this.state.displayIframe && (
            <div>
              <VideoPin
                player={this.YT}
                openImportDialog={this.props.openImportDialog}
                listRecords={listRecord}
                rootRecord={this.props.rootRecord}
                videoState={this.state.videoState}
                pin={this.pin}
                playOrPauseVideo={this.playOrPauseVideo}
                seekTo={this.seekTo}
                updateTime={this.updateTime}
                removeItem={this.confirmDelete}
                updateHeight={this.updateHeight}
                changePlaybackRate={this.changePlaybackRate}
                handleLike={this.handleLike}
                handleUserUpdate={this.handleUserUpdate}
                duration={this.state.duration}
                parentHeight={this.state.height}
              />
              
            </div>
          )}
        </div>
        <Dialog
          isShow={this.state.showConfirmDeleteDialog}
          title="Delete comment"
          message="Delete your comment permanently?"
          noText="CANCEL"
          yesText="DELETE"
          clickYes={this.removeItem}
          onClose={() => { this.setState({ showConfirmDeleteDialog: false, idToDelete: "" }) }}
        />
      </>

    );
  }

}
