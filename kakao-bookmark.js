javascript:(function() {

    var divs = document.querySelectorAll('.DC2CN');

    if (divs.length > 0) {

        var contentHtml = divs[0].outerHTML;


        var titleElement = document.querySelector(".toon-title");
        var fileName = titleElement ? titleElement.getAttribute("title") : "DC2CN_content";
        fileName = fileName.replace(/<|>|\/|:|"|%27|\?|\\|\*|&|#|%|\s/g, "_").slice(0, 50);
        fileName += ".html";


        var blob = new Blob([contentHtml], { type: "text/html" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    } else {
        alert("DC2CN 클래스를 가진 div 요소를 찾을 수 없습니다.");
    }
})();
