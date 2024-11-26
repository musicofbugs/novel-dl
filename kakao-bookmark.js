javascript:(function() {
    function saveDivAsHTML() {

        const targetDivClassName = "DC2CN";
        const targetH1ClassName = "txt";


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


        const fileName = `${targetH1.textContent.trim()}.html`;


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
