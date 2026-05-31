const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea-input");
const mindmap = document.querySelector("#mindmap");

let ideaCount = 0;

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ideaText = ideaInput.value.trim();

  if (ideaText === "") {
    return;
  }

  ideaCount += 1;

  const node = document.createElement("div");
  node.classList.add("node");
  node.textContent = ideaText;

  const angle = ideaCount * 55;
  const distance = 150;
  const x = Math.cos(angle * Math.PI / 180) * distance;
  const y = Math.sin(angle * Math.PI / 180) * distance;

  node.style.position = "absolute";
  node.style.left = `calc(50% + ${x}px)`;
  node.style.top = `calc(50% + ${y}px)`;
  node.style.transform = "translate(-50%, -50%)";

  mindmap.appendChild(node);
  ideaInput.value = "";
  ideaInput.focus();
});
