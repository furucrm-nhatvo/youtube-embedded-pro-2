import quip, { MenuCommand } from "quip-apps-api";
import quiptext from "quiptext";
import { RootEntity } from "./model/root";
function handlePlaybackCountingCycle(cycle: string) {
  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  rootRecord.set("playbackCountingCycle", cycle);
}
function toggleCommentHighlight(){
  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  rootRecord.set("commentHighlight", !rootRecord.get('commentHighlight'));
}
const playbackCountingCycleCommands: MenuCommand[] = [
  {
    id: "playback-counting-cycle",
    label: quiptext("⚙️"), // Playback Counting Cycle
    subCommands: ["1h", "3h", "6h", "12h", "24h", 'playtime'],
  },
  {
    id: "1h",
    label: quiptext("1h"),
    handler: () => {
      handlePlaybackCountingCycle("1h");
      updateToolbar();
    },
  },
  {
    id: "3h",
    label: quiptext("3h"),
    handler: () => {
      handlePlaybackCountingCycle("3h");
      updateToolbar();
    },
  },
  {
    id: "6h",
    label: quiptext("6h"),
    handler: () => {
      handlePlaybackCountingCycle("6h");
      updateToolbar();
    },
  },
  {
    id: "12h",
    label: quiptext("12h"),
    handler: () => {
      handlePlaybackCountingCycle("12h");
      updateToolbar();
    },
  },
  {
    id: "24h",
    label: quiptext("Every other day"),
    handler: () => {
      handlePlaybackCountingCycle("24h");
      updateToolbar();
    },
  },
  {
    id: "playtime",
    label: quiptext("Play time of this video"),
    handler: () => {
      handlePlaybackCountingCycle("playtime");
      updateToolbar();
    },
  },
];

const infoCommands: MenuCommand[] = [
  {
    id: "help",
    label: quiptext("ヘルプ"),
    subCommands: ["about", "youtube-channel", "contact"],
  },

  {
    id: "about",
    label: quiptext("リゾルバについて"),
    handler: () => {
      quip.apps.openLink("https://www.re-solver.co.jp");
    },
  },
  {
    id: "youtube-channel",
    label: quiptext("Youtubeチャンネル"),
    handler: () => {
      quip.apps.openLink(
        "https://www.youtube.com/channel/UCIBIz9kZp7XhLn77vD5a26g"
      );
    },
  },
  {
    id: "contact",
    label: quiptext("お問い合わせ"),
    handler: () => {
      quip.apps.openLink("https://www.re-solver.co.jp/contact");
    },
  },
];

const getToolbarCommandIds = () => {
  const toolbarCommandIds: string[] = ["toggle-highlight", quip.apps.DocumentMenuCommands.SEPARATOR,"playback-counting-cycle",quip.apps.DocumentMenuCommands.SEPARATOR, "help",];
  return toolbarCommandIds;
};
const getHighlightedCommandIds = () => {
  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  let highlightedCommandId = rootRecord.get("playbackCountingCycle");
  const highlightedCommandIds: string[] = [highlightedCommandId];
  return highlightedCommandIds;
};
export const updateToolbar = () => {
  quip.apps.updateToolbar({
    menuCommands: [...playbackCountingCycleCommands, ...infoCommands, {
      id: "toggle-highlight",
      label: "💬",
      handler: () => toggleCommentHighlight(),
      
  },],
    toolbarCommandIds: getToolbarCommandIds(),
    highlightedCommandIds: getHighlightedCommandIds(),
  });
};
