const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea-input");
const editPanel = document.querySelector("#edit-panel");
const editTitle = document.querySelector("#edit-title");
const editDescription = document.querySelector("#edit-description");
const deleteNodeButton = document.querySelector("#delete-node");
const mindmap = document.querySelector("#mindmap");

const storageKey = "mindshare-ideas";
let ideas = loadIdeas();
let selectedIdeaId = null;

function createIdeaId() {
  return `idea-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getDefaultPosition(index) {
  const angle = (index + 1) * 55;
  const distance = 150;

  return {
    x: Math.cos(angle * Math.PI / 180) * distance,
    y: Math.sin(angle * Math.PI / 180) * distance,
  };
}

function normalizeIdea(idea, index) {
  const position = getDefaultPosition(index);

  if (typeof idea === "string") {
    return {
      id: createIdeaId(),
      title: idea,
      description: "",
      x: position.x,
      y: position.y,
    };
  }

  return {
    id: idea.id ?? createIdeaId(),
    title: idea.title ?? idea.text ?? "Neue Idee",
    description: idea.description ?? "",
    x: idea.x ?? position.x,
    y: idea.y ?? position.y,
  };
}

function loadIdeas() {
  const savedIdeas = localStorage.getItem(storageKey);

  if (savedIdeas === null) {
    return [];
  }

  try {
    return JSON.parse(savedIdeas).map(normalizeIdea);
  } catch {
    return [];
  }
}

function saveIdeas() {
  localStorage.setItem(storageKey, JSON.stringify(ideas));
}

function findSelectedIdea() {
  return ideas.find((idea) => idea.id === selectedIdeaId);
}

function positionNode(node, x, y) {
  node.style.left = `calc(50% + ${x}px)`;
  node.style.top = `calc(50% + ${y}px)`;
}

function updateNodeSelection() {
  document.querySelectorAll(".node[data-idea-id]").forEach((node) => {
    node.classList.toggle("node-selected", node.dataset.ideaId === selectedIdeaId);
  });
}

function openEditPanel(idea) {
  selectedIdeaId = idea.id;
  editTitle.value = idea.title;
  editDescription.value = idea.description;
  editPanel.hidden = false;
  updateNodeSelection();
}

function closeEditPanel() {
  selectedIdeaId = null;
  editPanel.hidden = true;
  editTitle.value = "";
  editDescription.value = "";
  updateNodeSelection();
}

function makeNodeDraggable(node, idea) {
  node.addEventListener("pointerdown", (event) => {
    node.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = idea.x;
    const originalY = idea.y;
    let didMove = false;

    function handlePointerMove(moveEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      didMove = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;
      idea.x = originalX + deltaX;
      idea.y = originalY + deltaY;
      positionNode(node, idea.x, idea.y);
    }

    function finishDrag() {
      if (didMove) {
        saveIdeas();
      } else {
        openEditPanel(idea);
      }

      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerup", finishDrag);
      node.removeEventListener("pointercancel", finishDrag);
    }

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerup", finishDrag);
    node.addEventListener("pointercancel", finishDrag);
  });
}

function createIdeaNode(idea) {
  const node = document.createElement("div");
  node.classList.add("node");
  node.dataset.ideaId = idea.id;
  node.textContent = idea.title;

  node.style.position = "absolute";
  node.style.transform = "translate(-50%, -50%)";
  positionNode(node, idea.x, idea.y);
  makeNodeDraggable(node, idea);

  mindmap.appendChild(node);
}

function removeIdeaNode(ideaId) {
  const node = document.querySelector(`[data-idea-id="${ideaId}"]`);

  if (node !== null) {
    node.remove();
  }
}

ideas.forEach((idea) => {
  createIdeaNode(idea);
});
saveIdeas();

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ideaText = ideaInput.value.trim();

  if (ideaText === "") {
    return;
  }

  const position = getDefaultPosition(ideas.length);
  const idea = {
    id: createIdeaId(),
    title: ideaText,
    description: "",
    x: position.x,
    y: position.y,
  };

  ideas.push(idea);
  saveIdeas();
  createIdeaNode(idea);
  openEditPanel(idea);

  ideaInput.value = "";
  ideaInput.focus();
});

editPanel.addEventListener("submit", (event) => {
  event.preventDefault();

  const idea = findSelectedIdea();

  if (idea === undefined) {
    closeEditPanel();
    return;
  }

  const title = editTitle.value.trim();

  if (title === "") {
    return;
  }

  idea.title = title;
  idea.description = editDescription.value.trim();
  saveIdeas();

  const node = document.querySelector(`[data-idea-id="${idea.id}"]`);

  if (node !== null) {
    node.textContent = idea.title;
  }
});

deleteNodeButton.addEventListener("click", () => {
  const idea = findSelectedIdea();

  if (idea === undefined) {
    closeEditPanel();
    return;
  }

  ideas = ideas.filter((item) => item.id !== idea.id);
  saveIdeas();
  removeIdeaNode(idea.id);
  closeEditPanel();
});
