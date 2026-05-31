const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea-input");
const mindmap = document.querySelector("#mindmap");

const storageKey = "mindshare-ideas";
let ideas = loadIdeas();

function getDefaultPosition(index) {
  const angle = (index + 1) * 55;
  const distance = 150;

  return {
    x: Math.cos(angle * Math.PI / 180) * distance,
    y: Math.sin(angle * Math.PI / 180) * distance,
  };
}

function loadIdeas() {
  const savedIdeas = localStorage.getItem(storageKey);

  if (savedIdeas === null) {
    return [];
  }

  try {
    return JSON.parse(savedIdeas).map((idea, index) => {
      if (typeof idea === "string") {
        const position = getDefaultPosition(index);

        return {
          text: idea,
          x: position.x,
          y: position.y,
        };
      }

      return idea;
    });
  } catch {
    return [];
  }
}

function saveIdeas() {
  localStorage.setItem(storageKey, JSON.stringify(ideas));
}

function positionNode(node, x, y) {
  node.style.left = `calc(50% + ${x}px)`;
  node.style.top = `calc(50% + ${y}px)`;
}

function makeNodeDraggable(node, idea) {
  node.addEventListener("pointerdown", (event) => {
    node.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = idea.x;
    const originalY = idea.y;

    function handlePointerMove(moveEvent) {
      idea.x = originalX + moveEvent.clientX - startX;
      idea.y = originalY + moveEvent.clientY - startY;
      positionNode(node, idea.x, idea.y);
    }

    function finishDrag() {
      saveIdeas();
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
  node.textContent = idea.text;

  node.style.position = "absolute";
  node.style.transform = "translate(-50%, -50%)";
  positionNode(node, idea.x, idea.y);
  makeNodeDraggable(node, idea);

  mindmap.appendChild(node);
}

ideas.forEach((idea) => {
  createIdeaNode(idea);
});

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const ideaText = ideaInput.value.trim();

  if (ideaText === "") {
    return;
  }

  const position = getDefaultPosition(ideas.length);
  const idea = {
    text: ideaText,
    x: position.x,
    y: position.y,
  };

  ideas.push(idea);
  saveIdeas();
  createIdeaNode(idea);

  ideaInput.value = "";
  ideaInput.focus();
});
