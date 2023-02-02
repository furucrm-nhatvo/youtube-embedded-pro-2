export const formatTime = (time: number) => {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time - h * 3600) / 60);
  const s = Math.floor(time - h * 3600 - m * 60);
  let _h: string, _m: string, _s: string;
  _h = h < 10 ? "0" + h : h.toString();
  _m = m < 10 ? "0" + m : m.toString();
  _s = s < 10 ? "0" + s : s.toString();
  return _h + ":" + _m + ":" + _s;
};
