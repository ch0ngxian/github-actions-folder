const [_, username, repository] = window.location.pathname.split("/");
const apiPath = `/${username}/${repository}/actions/workflows_partial`;
const workflowPrefix = `/${username}/${repository}/actions/workflows`;

const MAX_ITERATION = 1;
const MAX_CONCURRENT_CALLS = 2;

const listWorkflows = async () => {
  let allWorkflows = [];
  let page = 0;

  for (const x in [...Array(MAX_ITERATION)]) {
    const responses = await Promise.all(
      [...Array(MAX_CONCURRENT_CALLS)].map((_) => {
        page = page + 1;
        return fetch(`${apiPath}?page=${page}`);
      })
    );

    const texts = await Promise.all(
      responses.map((response) => {
        return response.text();
      })
    );

    const workflowsHtml = new DOMParser().parseFromString(`<div>${texts.join("\n")}</div>`, "text/xml");
    const workflowsNodes = workflowsHtml.querySelectorAll("a.ActionList-content");

    const workflows = Array.from(workflowsNodes).map((workflowNode) => {
      return {
        url: workflowNode.getAttribute("href"),
        name: workflowNode.getElementsByClassName("ActionList-item-label")[0].innerHTML,
      };
    });

    allWorkflows = allWorkflows.concat(workflows);
  }

  return allWorkflows;
};

const convertWorkflowsToTree = (workflows) => {
  let tree = {};

  workflows.forEach((workflow) => {
    const urlParts = workflow.url.replace(workflowPrefix, "").split("/");

    let current = tree;
    for (let i = 1; i < urlParts.length - 1; i++) {
      const part = urlParts[i];
      current[part] = current[part] || {};
      current = current[part];
    }

    const folderName = urlParts[urlParts.length - 1];
    current[folderName] = workflow;
  });

  return tree;
};

const initiateWorkflowsGrouping = async () => {
  const workflows = await listWorkflows();
  const tree = convertWorkflowsToTree(workflows);

  console.log(tree);
};

initiateWorkflowsGrouping();
