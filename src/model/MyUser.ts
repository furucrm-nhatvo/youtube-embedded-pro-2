import quip from "quip-apps-api";

export default class MyUser extends quip.apps.Record {
  static getProperties = () => ({
    id: "string",
    name: "string",
    actionTimestamp: "number",
    clickedPinCount: "number",
  });

  static getDefaultProperties = () => ({
    id: "",
    name: "",
    actionTimestamp: 0,
    clickedPinCount: 0,
  });

  getId() {
    return this.get("id") as string;
  }

  setId(id: String) {
    this.set("id", id);
  }

  getName() {
    return this.get("name") as string;
  }

  setName(name: string) {
    this.set("name", name);
  }

  getData() {
    return {
      id: this.get("id") as string,
      name: this.get("name") as string,
      actionTimestamp: this.get("actionTimestamp") as number,
      clickedPinCount: this.get("clickedPinCount") as number,
    };
  }
}
