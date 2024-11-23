async function downloadNovel(title, episodeLinks, startEpisode, endEpisode) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const { modal, modalContent } = createModal();
    document.body.appendChild(modal);

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '10px';
    progressBar.style.backgroundColor = '#008CBA';
    progressBar.style.marginTop = '10px';
    progressBar.style.borderRadius = '3px';
    modalContent.appendChild(progressBar);

    const progressLabel = document.createElement('div');
    progressLabel.style.marginTop = '5px';
    modalContent.appendChild(progressLabel);

    const startTime = new Date();
    const startingIndex = episodeLinks.length - startEpisode;

    for (let i = startingIndex; i >= startingIndex - (endEpisode - startEpisode); i--) {
        const episodeUrl = episodeLinks[i];

        if (!episodeUrl.startsWith('https://booktoki')) {
            console.log(`Skipping invalid episode link: ${episodeUrl}`);
            continue;
        }

        const episodeNumber = startingIndex - i + 1;
        const logText = `Downloading: ${title} - Episode ${episodeNumber}/${endEpisode - startEpisode + 1}`;
        console.log(logText);

        let episodeContent = await fetchNovelContent(episodeUrl);

        if (!episodeContent) {
            console.error(`Failed to fetch content for episode: ${episodeUrl}`);

            const userConfirmed = await new Promise(resolve => {
                const confirmResult = confirm(`이 페이지에 캡챠가 발견되었습니다.
${episodeUrl}.
새 탭에서 해당 페이지에 접속하여 캡챠를 풀고, 확인을 눌러주세요.`);
                resolve(confirmResult);
            });

            if (userConfirmed) {
                episodeContent = await fetchNovelContent(episodeUrl);
                if (!episodeContent) {
                    console.error(`Failed to fetch content for episode after CAPTCHA: ${episodeUrl}`);
                    continue;
                }
            } else {
                console.log("User cancelled. Skipping this episode.");
                continue;
            }
        }

        // HTML 포맷팅
        const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Episode ${episodeNumber}</title>
</head>
<body>
    <h1>${title} - Episode ${episodeNumber}</h1>
    <div>${episodeContent}</div>
</body>
</html>`;

        // HTML 파일로 저장
        const fileName = `${title}-Episode${episodeNumber}.html`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        // Progress 업데이트
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
}
