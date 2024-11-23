javascript:(function() {
    var novelContent = document.getElementById("novel_content");

    if (novelContent) {
        var contentHtml = novelContent.outerHTML;

        // 첫 번째 <p> 요소 처리
        var firstParagraph = novelContent.querySelector("p");
        if (firstParagraph) {
            var emptyLine1 = document.createElement("p");
            emptyLine1.innerHTML = "&nbsp;";  // 빈 줄 추가
            var emptyLine2 = document.createElement("p");
            emptyLine2.innerHTML = "&nbsp;";  // 빈 줄 추가

            // 첫 번째 <p> 뒤에 빈 줄 두 개 추가
            firstParagraph.parentNode.insertBefore(emptyLine1, firstParagraph.nextSibling);
            firstParagraph.parentNode.insertBefore(emptyLine2, emptyLine1.nextSibling);
        }

        // 마지막 <p> 요소 처리: "끝"으로 끝나는 텍스트는 삭제
        var lastParagraph = novelContent.querySelector("p:last-child");
        if (lastParagraph && lastParagraph.textContent.trim().endsWith("끝")) {
            lastParagraph.parentNode.removeChild(lastParagraph);
        }

        // 파일 이름 생성: ".toon-title"에서 제목을 가져오고 특수 문자를 처리
        var titleElement = document.querySelector(".toon-title");
        var fileName = titleElement ? titleElement.getAttribute("title") : "novel_content";
        fileName = fileName
            .replace(/<|>|\/|:|"|%27|\?|\\|\*|&|#|%|\s/g, "_")  // 특수 문자 처리
            .slice(0, 50);  // 파일 이름 길이 제한
        fileName += ".html";

        // Blob을 사용하여 HTML 파일로 다운로드
        var blob = new Blob([novelContent.innerHTML], { type: "text/html" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();  // 다운로드 시작
    } else {
        alert("novel_content ID를 찾을 수 없습니다.");
    }
})();
