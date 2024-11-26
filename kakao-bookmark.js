javascript:(function() {
    function saveDivAsHTML() {

        const targetClassName = "DC2CN";
        const titleSelector = "h1.txt";


        const targetDiv = document.querySelector(`div.${targetClassName}`);
        const titleElement = document.querySelector(titleSelector);

        if (!targetDiv) {
            alert(`클래스 이름 "${targetClassName}"를 가진 요소를 찾을 수 없습니다.`);
            return;
        }

        if (!titleElement) {
            alert(`제목 요소 "${titleSelector}"를 찾을 수 없습니다.`);
            return;
        }


        let fileName = titleElement.textContent.trim();
        fileName = fileName.replace(/[/\\?%*:|"<>]/g, "_"); // 파일명에 사용할 수 없는 문자 제거
        fileName += ".html";


        const contentHtml = targetDiv.outerHTML;


        const blob = new Blob([contentHtml], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        console.log(`Saved: ${fileName}`);
    }

    saveDivAsHTML();
})();
