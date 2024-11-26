javascript:(function() {
    
    var divs = document.querySelectorAll('.DC2CN');

    if (divs.length > 0) {
    
        var titleElement = document.querySelector(".toon-title");
        var baseFileName = titleElement ? titleElement.getAttribute("title") : "DC2CN_content";
        baseFileName = baseFileName.replace(/<|>|\/|:|"|%27|\?|\\|\*|&|#|%|\s/g, "_").slice(0, 50);

    
        divs.forEach(function(div, index) {
            var contentHtml = div.outerHTML;

    
            var fileName = baseFileName + "_part_" + (index + 1) + ".html";

    
            var blob = new Blob([contentHtml], { type: "text/html" });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
        });
    } else {
        alert("DC2CN 클래스를 가진 div 요소를 찾을 수 없습니다.");
    }
})();
