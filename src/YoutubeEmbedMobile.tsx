import React, { Component } from "react";
import quip from "quip-apps-api";
import VideoPinMobile from "./components/VideoPinMobile";

export default class extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      videoTitle: "",
      thumbnailUrl: "",
    };
  }

  componentDidMount() {
    this.loadVideoInfo();
  }

  loadVideoInfo = () => {
    fetch(`https://www.youtube.com/oembed?url=${this.props.videoUrl}`)
      .then(response => response.json())
      .then(data => {
        const videoTitle: string = data?.title;
        const thumbnailUrl: string = data?.["thumbnail_url"];
        this.setState({ videoTitle, thumbnailUrl });
      })
      .catch(error => console.log(error));
  };

  render() {
    return (
      this.state.videoTitle && (
        <>
          <div
            className="video-mobile"
            style={{ width: "100%" }}
            onClick={() => {
              quip.apps.openLink(this.props.videoUrl);
            }}
          >
            <div className="video-mobile__info">
              <div className="video-mobile__info-title">
                {this.state.videoTitle}
              </div>
              <div className="video-mobile__info-url">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAC4ElEQVRoge2YT0hUQRzHP/PyX1rmJgbSqhhBB7sVGFFRFIR06GKH6GTdN7p4ibAg6hKRREiUBWFFdYkIi7oESZkgXYQoqGjdg6fN1t6qqPvr4Jrre7P5dmffpvA+MPD4zcxvft/9zc6b94OAgICAgIBVjPI6UA5SyzRhoBFFE9AAbAZC6VaTbhXpKWsznqeAyYznn8B4usURYljESBEFoswxqt4TNxIgYLGXUwjHUbQClV7FFogkwgcUD3hLrwLRDdIKkBbK2Mgz4LCvIXpF8QKbo2qYGWeXpZ0Q4hIrJXgAoY1KLuq6XBmQ/VQwxxiwwffAciNBkno1TDLT6M7ALLtYecEDVLOOVqdRt4W2FCGY/Eix1WnSCWguQij54kmAWQauvobmFiMXWREvAhRho0V2HoLejxDphqoC/5Us94+ry8B644VKSqE9Ao++QvtpsPSndR7UOQ06z1WFWo3qWohcg5tDsH23uT+hThxHv24LFU7AAtt2wI0BuPAYNjWYeCqjjbJMg1uA+CAAQCk4cAz6PkHHeSgtz89PnCUT/d1COiqqoKML7o3MC8qVNX9vuEC2u1AxEIHpyeXHObGWXuhKNENs5u/1/jBlw8Mr0HcZZqZznS3Uk8g0uAUobMQHASLwqg96OiE+lq+X3+oJc5kGtwDBztd7Vj4PQ3cERt6ZevrlNGTbQoUhPgZ3uuD5bUilzP0J406TTsCE8UKzM/C0B3rPgZ1YfrxXlJcMCDHvn/oaBvvh+hkY/WLgJAvCD6dJl4FvRot0HjGavgyu2HTvge9+RmCIKzadALMM+IuHDJQwiOa4WgEkmGTIaXQJUG+YAm4VJaRcUPQ4KxKQ7S4U5yzw0u+YcqAfm3O6jn+VFhX7OEmKE/+ttAiDCPcZ4G5OpUUdsocQFmFSNKEIowgjNKKoIUUNEEJRzeInaTmLopPAws1tIt0yC7yjCDEgiiLKLDGvxd2AgICAgIBVzR8UibLdyBYx4AAAAABJRU5ErkJggg==" />
                <div className="video-mobile__info-text">
                  {this.props.videoUrl}
                </div>
              </div>
            </div>
            <div className="video-mobile__thumbnail">
              <img src={this.state.thumbnailUrl} />
            </div>
          </div>
          <VideoPinMobile videoUrl={this.props.videoUrl} />
        </>
      )
    );
  }
}
