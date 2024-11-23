javascript:(function(){
    async function fetchPage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${response.statusText}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            return parser.parseFromString(text, 'text/html');
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function downloadNovel(title, episodeLinks, startEpisode, endEpisode) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        const startingIndex = episodeLinks.length - startEpisode;

        for (let i = startingIndex; i >= startingIndex - (endEpisode - startEpisode); i--) {
            const episodeUrl = episodeLinks[i];
            const episodeNumber = startingIndex - i + 1;

            if (!episodeUrl.startsWith('https://booktoki')) {
                console.log(`Skipping invalid episode link: ${episodeUrl}`);
                continue;
            }

            const episodePage = await fetchPage(episodeUrl);
            if (!episodePage) {
                console.error(`Failed to fetch content for episode: ${episodeUrl}`);
                continue;
            }

            // novel_content 요소 추출
            const novelContent = episodePage.getElementById("novel_content");
            if (!novelContent) {
                console.error(`novel_content ID를 찾을 수 없습니다: ${episodeUrl}`);
                continue;
            }

            // 첫 줄 처리
            let firstElement = novelContent.querySelector("p, div");
            if (firstElement) {
                firstElement.style.fontWeight = "bold";
                firstElement.style.textAlign = "center";

                const emptyLine1 = document.createElement(firstElement.tagName.toLowerCase());
                emptyLine1.innerHTML = "&nbsp;";
                const emptyLine2 = document.createElement(firstElement.tagName.toLowerCase());
                emptyLine2.innerHTML = "&nbsp;";
                firstElement.parentNode.insertBefore(emptyLine1, firstElement.nextSibling);
                firstElement.parentNode.insertBefore(emptyLine2, emptyLine1.nextSibling);
            }

            // 마지막 줄 처리
            let lastElement = novelContent.querySelector("p:last-child, div:last-child");
            if (lastElement && lastElement.textContent.trim().endsWith("끝")) {
                lastElement.parentNode.removeChild(lastElement);
            }

            // 파일 이름 설정: ".toon-title"에서 제목 가져오기
            const titleElement = episodePage.querySelector(".toon-title");
            const fileName = titleElement
                ? titleElement.getAttribute("title").replace(/<|>|\/|:|"|%27|\?|\\|\*|&|#|%|\s/g, "_").slice(0, 50) + ".html"
                : `Episode_${episodeNumber}.html`;

            const contentHtml = novelContent.outerHTML;
            const blob = new Blob([contentHtml], { type: "text/html" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            a.click();

            console.log(`Saved: ${fileName}`);
            await delay(1500); // 각 요청 사이에 1.5초 지연
        }
    }

    async function runCrawler() {
        const novelPageRule = 'https://booktoki';
        let currentUrl = window.location.href;

        if (!currentUrl.startsWith(novelPageRule)) {
            alert('이 스크립트는 소설 에피소드 목록 페이지에서 실행해야 합니다.');
            return;
        }

        const title = document.title || 'Novel';

        const totalPages = prompt('소설 목록의 페이지 수를 입력하세요 (1, 2, 3...):', '1');
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
})();
