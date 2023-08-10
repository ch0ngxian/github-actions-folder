console.log("Loaded content.js");

const workflowsHtml = document.querySelector("ul[aria-label='Filter workflows']");
console.log(workflowsHtml);

const workflowsNodes = workflowsHtml.querySelectorAll("a.ActionList-content");
const workflowUrls = Array.from(workflowsNodes).map((workflow) => workflow.getAttribute("href"));

console.log(workflowUrls);
