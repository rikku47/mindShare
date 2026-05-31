const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea-input");
const mindmap = document.querySelector("#mindmap");

const storageKey = "mindshare-ideas";
let ideas = loadIdeas();

function loadIdeas() {
  const savedIdeas = localStorage.getItem(storageKey);

  if (savedIdeas === null) {
    return [];
  }

  try {
    return JSON.parse(savedIdeas);
  } catch {
    return [];
  }
}

function saveIdeas() {
  localStorage.setItem(storageKey, JSON.stringify(ideas));
}

function createIdeaNode(ideaText, index) {
  const node = document.createElement("div");
  node.classList.add("node");
  node.textContent = ideaText;

  const angle = (index + 1) * 55;
  const distance = 150;
  const x = Math.cos(angle * Math.PI / 180) * distance;
  const y = Math.sin(angle * Math.PI / 180) * distance;

  node.style.position = "absolute";
  node.style.left = `calc(50% + ${x}px)`;
  node.style.top = `calc(50% + ${y}px)`;
  node.style.transform = "translate(-50%, -50%)";

  mindmap.appendChild(node);
}

ideas.forEach((ideaText, index) => {
  createIdeaNode(ideaText, index);
});

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ideaText = ideaInput.value.trim();

  if (ideaText === "") {
    return;
  }

  ideas.push(ideaText);
  saveIdeas();
  createIdeaNode(ideaText, ideas.length - 1);

  ideaInput.value = "";
  ideaInput.focus();
});
