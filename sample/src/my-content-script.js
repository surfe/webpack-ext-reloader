import depSample from "./dependency-sample";

console.info("Change anything here!! It will hot-reload the extension :)");
console.log(depSample());

const title = document.createElement("h1");
title.innerHTML = "test :D";
document.body.prepend(title);
