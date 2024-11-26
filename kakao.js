javascript:(function() {
    function saveDivAsHTML() {
        // 대상 클래스 이름
        const targetDivClassName = "DC2CN";
        const targetH1ClassName = "txt";

        // div와 h1 요소 찾기
        const targetDiv = document.querySelector(`div.${targetDivClassName}`);
        const targetH1 = document.querySelector(`h1.${targetH1ClassName}`);

        if (!targetDiv) {
            alert(`클래스 이름 "${targetDivClassName}"를 가진 요소를 찾을 수 없습니다.`);
            return;
        }

        if (!targetH1) {
            alert(`클래스 이름 "${targetH1ClassName}"를 가진 h1 요소를 찾을 수 없습니다.`);
            return;
        }

        // h1 텍스트 내용으로 파일명 생성
        const fileName = `${targetH1.textContent.trim()}.html`;

        // 요소의 HTML 가져오기
        const contentHtml = targetDiv.outerHTML;

        // Blob 생성 및 다운로드 링크 생성
        const blob = new Blob([contentHtml], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();

        console.log(`Saved: ${fileName}`);
    }

    saveDivAsHTML();
})();
