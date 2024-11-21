async function downloadNovel(title, episodeLinks, startEpisode, endEpisode) {
    let novelText = `${title}\n`;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const {modal, modalContent} = createModal();
    document.body.appendChild(modal);

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '10px';
    progressBar.style.backgroundColor = '#008CBA';
    progressBar.style.marginTop = '10px';
    progressBar.style.borderRadius = '3px';
    modalContent.appendChild(progressBar);

    const progressLabel = document.createElement('div');
//    progressLabel.style.marginTop = '5px';
    modalContent.appendChild(progressLabel);

    const startTime = new Date();
    const startingIndex = episodeLinks.length - startEpisode;

    // Update loop to download from startEpisode to endEpisode (inclusive)
    for (let i = startingIndex; i >= startingIndex - (endEpisode - startEpisode); i--) {
        const episodeUrl = episodeLinks[i];

        if (!episodeUrl.startsWith('https://booktoki')) {
            console.log(`Skipping invalid episode link: ${episodeUrl}`);
            continue;
        }

        const logText = `Downloading: ${title} - Episode ${startingIndex - i + 1}/${endEpisode - startEpisode + 1}`;
        console.log(logText);

        let episodeContent = await fetchNovelContent(episodeUrl);

        if (!episodeContent) {
            console.error(`Failed to fetch content for episode: ${episodeUrl}`);

            // Ask the user to solve the CAPTCHA
            const userConfirmed = await new Promise(resolve => {
                const confirmResult = confirm(`이 페이지에 캡챠가 발견되었습니다.
${episodeUrl}.
새 탭에서 해당 페이지에 접속하여 캡챠를 풀고, 확인을 눌러주세요.`);
                resolve(confirmResult);
            });

            if (userConfirmed) {
                // Retry fetching the content
                episodeContent = await fetchNovelContent(episodeUrl);
                if (!episodeContent) {
                    console.error(`Failed to fetch content for episode after CAPTCHA: ${episodeUrl}`);
                    continue;  // Skip this episode if it still fails
                }
            } else {
                console.log("User cancelled. Skipping this episode.");
                continue;
            }
        }

        novelText += episodeContent;

        const progress = ((startingIndex - i + 1) / (endEpisode - startEpisode + 1)) * 100;
        progressBar.style.width = `${progress}%`;

        const elapsedTime = new Date() - startTime;
        const estimatedTotalTime = (elapsedTime / progress) * 100;
        const remainingTime = estimatedTotalTime - elapsedTime;
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        progressLabel.textContent = `다운로드중... ${progress.toFixed(2)}%  -  남은 시간: ${remainingMinutes}분 ${remainingSeconds}초`;

        await delay(Math.random() * 500 + 1000);
    }

    document.body.removeChild(modal);

    const fileName = `${title}(${startEpisode}~${endEpisode}).txt`;
    const blob = new Blob([novelText], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}

async function runCrawler() {
    const novelPageRule = 'https://booktoki';
    let currentUrl = window.location.href;

    // Clean URL
    const urlParts = currentUrl.split('?')[0];
    currentUrl = urlParts;

    if (!currentUrl.startsWith(novelPageRule)) {
        console.log('This script should be run on the novel episode list page.');
        return;
    }

    const title = extractTitle();

    if (!title) {
        console.log('Failed to extract the novel title.');
        return;
    }

    const totalPages = prompt(`소설 목록의 페이지 수를 입력하세요.
(1000화가 넘지 않는 경우 1, 1000화 이상부터 2~)`, '1');

    if (!totalPages || isNaN(totalPages)) {
        console.log('Invalid page number or user canceled the input.');
        return;
    }

    const totalPagesNumber = parseInt(totalPages, 10);
    const allEpisodeLinks = [];

    for (let page = 1; page <= totalPagesNumber; page++) {
        const nextPageUrl = `${currentUrl}?spage=${page}`;
        const nextPageDoc = await fetchPage(nextPageUrl);
        if (nextPageDoc) {
            const nextPageLinks = Array.from(nextPageDoc.querySelectorAll('.item-subject')).map(link => link.getAttribute('href'));
            allEpisodeLinks.push(...nextPageLinks);
        }
    }

    const startEpisode = prompt(`다운로드를 시작할 회차 번호를 입력하세요 (1 부터 ${allEpisodeLinks.length}):`, '1');
    const endEpisode = prompt(`다운로드를 마칠 회차 번호를 입력하세요 (1 부터 ${allEpisodeLinks.length}):`, allEpisodeLinks.length.toString());

    if (!startEpisode || !endEpisode || isNaN(startEpisode) || isNaN(endEpisode)) {
        console.log('Invalid episode numbers or user canceled the input.');
        return;
    }

    const startEpisodeNumber = parseInt(startEpisode, 10);
    const endEpisodeNumber = parseInt(endEpisode, 10);

    if (startEpisodeNumber < 1 || endEpisodeNumber < startEpisodeNumber || endEpisodeNumber > allEpisodeLinks.length) {
        console.log('Invalid episode range. Please enter a valid range.');
        return;
    }

    console.log(`Task Appended: Preparing to download ${title} from episode ${startEpisodeNumber} to ${endEpisodeNumber}`);

    downloadNovel(title, allEpisodeLinks, startEpisodeNumber, endEpisodeNumber);
}

runCrawler();
