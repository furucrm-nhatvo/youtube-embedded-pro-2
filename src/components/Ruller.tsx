import quip from 'quip-apps-api';
import React, { Component } from 'react'
import { RootEntity } from '../model/root';

export default class Ruller extends Component<any, any> {
  state = {
    original_height: "auto",
    height: 150,
    original_y: 0,
    original_mouse_y: 0,
  }
  interval: NodeJS.Timer;
  container = ''
  wrapper = ''
  componentDidMount() {
    this.container = this.props.containerCls
    this.wrapper = this.props.wrapperCls
  }
  onMouseDown = (e: any) => {
    e.preventDefault();
    const container = document.querySelector("." + this.container) as HTMLElement;
    if (container) {
      const wrapper = document.querySelector("." + this.wrapper) as HTMLElement;
      // console.log(wrapper)
      if (wrapper) wrapper.style.height = `${wrapper.getBoundingClientRect().height + 500}px`;
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
    let height = Number(this.state.original_height + (e.pageY - this.state.original_mouse_y));
    height = Math.max(this.props.minHeight, height)
    const container = document.querySelector("." + this.container) as HTMLElement;
    container.style.height = height + 'px'
    this.setState({ height });
  }
  stopResize = () => {
    const wrapper = document.querySelector("." + this.wrapper) as HTMLElement;
    if (wrapper) wrapper.style.height = "auto";
    this.setState({
      original_height: this.state.height,
    }, () => {
      const rootRecord = quip.apps.getRootRecord() as RootEntity;
      rootRecord.set(this.props.rootRecordVar, this.state.height);
    })
    window.removeEventListener('mousemove', this.resize)
    window.removeEventListener('mouseup', this.stopResize)
  }
  render() {
    return (
      <div style={rullerContainerStyle}>
        <div style={rullerStyle} onMouseDown={this.onMouseDown}></div>
      </div>
    )
  }
}





const rullerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
  bottom: "1px",
  border:'1px solid black',
  borderTop:'none'
} as React.CSSProperties;
const rullerStyle = {
  width: "80px",
  height: "10px",
  backgroundColor: "#ccc",
  cursor: "ns-resize"
} as React.CSSProperties;
// .video-container__ruller-container {
//     display: flex;
//     justify-content: center;
//     width: 100%;
//     border-bottom: 1px solid #ccc;
//     bottom: 0;
//     z-index: 3;
// }

// .video-container__ruller {
//     width: 40px;
//     height: 10px;
//     left: calc(50% - 20px);
//     background-color: #ccc;
//     cursor: ns-resize;
// }