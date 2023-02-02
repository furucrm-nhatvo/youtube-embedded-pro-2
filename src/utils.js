export function parseChapters(description){
    
    const firstSplitIndex = description.indexOf('\n0');
    const chapters=description.slice(firstSplitIndex+1).split('\n\n')[0].split('\n')
    let arr=[]
    for(let i=0;i<chapters.length;i++){
        const chapter=chapters[i]
        const splitIndex=chapter.indexOf(' ')
        const [startTime, title]=[chapter.slice(0,splitIndex), chapter.slice(splitIndex+1)];
        let endTime;
        const nextChapter=chapters[i+1]
        if(!nextChapter) {
           
        } else {
            const nextChapterSplitIndex=nextChapter.indexOf(' ')
            const nextChapterStartTime=nextChapter.slice(0,nextChapterSplitIndex)
            endTime=timeStringToSeconds(nextChapterStartTime)-1
        }
        
        arr.push({
            startTime:timeStringToSeconds(startTime),
            endTime,
            title
        }) 
    }
    return arr
}
export function secondsToTimeString(seconds){
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}
export function timeStringToSeconds(str){
    let p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

