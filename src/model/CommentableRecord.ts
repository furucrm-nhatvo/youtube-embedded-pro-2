import quip from "quip-apps-api";
export default class CommentableRecord extends quip.apps.Record {
  static getProperties = () => ({});

  private node: HTMLElement;

  getDom() {
    return this.node;
  }

  setDom(node: HTMLElement) {
    this.node = node;
  }

  supportsComments() {
    return true;
  }
}
