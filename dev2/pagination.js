function sleep(ms) {    return new Promise(resolve => setTimeout(resolve, ms));}let fontSize = 100;let pagesInfo = [];let isUpdating = false;function init(){     ReadiumSDK.reader.once(  ReadiumSDK.Events.PAGINATION_CHANGED, (data) => {         isUpdating = true;         ReadiumSDK.reader.getPagesCount();         ReadiumSDK.reader.once('CurrentViewPaginationCalculated', (data) => {             isUpdating = false;             pagesInfo = data;             updateInfo();         });     });}function updateInfo() {    let str;    const itemsNames = ReadiumSDK.reader.spine().items.map((e) => e.idref);    const interval1 = setInterval(() => {        console.log('----');        if(isUpdating) {            $('#info1').text('Loading...');            return;        }        const spine = ReadiumSDK.reader.spine().item(currentSpineIndex);        if (spine.paginationInfo.spreadCount !== 0){            const sCount = pagesInfo[spine.idref];            let currentPage = 0;            for(let item in itemsNames) {             //   console.log(itemsNames[item], spine.idref, spine.paginationInfo.currentPageIndex, sCount);                if(itemsNames[item] === spine.idref){                    currentPage += (spine.paginationInfo.currentPageIndex + 1);                    break;                }                currentPage += pagesInfo[itemsNames[item]];            }            const total = itemsNames.reduce((sum, e) => sum + pagesInfo[e],0);            str = `Chapter ${spine.href}: page ${spine.paginationInfo.currentPageIndex + 1} / ${sCount} (total: ${currentPage} / ${total})`;            $('#info1').text(str);        }    }, 500);}function zoom(n) {    fontSize += n;    ReadiumSDK.reader.updateSettings({fontSize});    setTimeout(()=> {        isUpdating = true;        ReadiumSDK.reader.getPagesCount();        ReadiumSDK.reader.once('CurrentViewPaginationCalculated', (data) => {            isUpdating = false            pagesInfo = data;            console.log('data_pages_count', data)        });    }, 1000);}function getPagesCount() {    const items = ReadiumSDK.reader.spine().items;    let count = 0;    items.forEach((e) => {        if( e.paginationInfo ) {            console.log(e);            count += e.paginationInfo.columnCount;        }    });    return count;}function setFontSize(fontSize) {    ReadiumSDK.reader.updateSettings({fontSize})}function addHighlight(){    ReadiumSDK.reader.plugins.highlights.addSelectionHighlight(Math.floor((Math.random()*1000000)), "test-highlight");}function prevPage(){    if(ReadiumSDK.reader.getPaginationInfo().canGoPrev()) {        ReadiumSDK.reader.openPagePrev();    }}function nextPage(){    if(ReadiumSDK.reader.getPaginationInfo().canGoNext()) {        ReadiumSDK.reader.openPageNext();    }}