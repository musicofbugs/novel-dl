async function downloadNovel(title, episodeLinks, startEpisode) {
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

    for (let i = startingIndex; i >= 0; i--) {
        const episodeUrl = episodeLinks[i];

        if (!episodeUrl.startsWith('https://booktoki')) {
            console.log(`Skipping invalid episode link: ${episodeUrl}`);
            continue;
        }

        const logText = `Downloading: ${title} - Episode ${startingIndex - i + 1}/${startingIndex + 1}`;
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

        // Create and download individual HTML files for each episode
        const fileName = `${title}_Episode_${startingIndex - i + 1}.html`;
        const blob = new Blob([episodeContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        const progress = ((startingIndex - i + 1) / (startingIndex + 1)) * 100;
        progressBar.style.width = `${progress}%`;

        const elapsedTime = new Date() - startTime;
        const estimatedTotalTime = (elapsedTime / progress) * 100;
        const remainingTime = estimatedTotalTime - elapsedTime;
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        progressLabel.textContent = `다운로드중... ${progress.toFixed(2)}%  -  남은 시간: ${remainingMinutes}분 ${remainingSeconds}초`;

        await delay(Math.random() * 500 + 1000); // Add a random delay between requests
    }

    document.body.removeChild(modal);
}
