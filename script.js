const attributes = {
  star: { label: "별", symbol: "✦", color: "#7867b8" },
  moon: { label: "달", symbol: "☾", color: "#4c6f9f" },
  forest: { label: "숲", symbol: "♧", color: "#3f7b58" },
  time: { label: "시간", symbol: "⌛", color: "#9a6b36" },
  memory: { label: "기억", symbol: "◇", color: "#a04f6f" },
};

const opponentCharacters = [
  {
    id: "mira",
    name: "미라의 서기관",
    icon: "✍",
    accent: "#7b5ea7",
    cards: [
      { id: "mira-star", name: "유성 잉크", attribute: "star", damage: 18, selectable: true },
      { id: "mira-moon", name: "달빛 장부", attribute: "moon", damage: 14, selectable: true },
      { id: "mira-time", name: "접힌 시각", attribute: "time", damage: 20, selectable: true },
      { id: "mira-memory", name: "지워진 행", attribute: "memory", damage: 16, selectable: true },
    ],
  },
  {
    id: "noa",
    name: "노아의 정원사",
    icon: "♧",
    accent: "#3f7b58",
    cards: [
      { id: "noa-forest", name: "잠든 덩굴", attribute: "forest", damage: 16, selectable: true },
      { id: "noa-star", name: "별씨앗", attribute: "star", damage: 12, selectable: true },
      { id: "noa-memory", name: "흙의 기억", attribute: "memory", damage: 17, selectable: true },
      { id: "noa-moon", name: "젖은 달잎", attribute: "moon", damage: 15, selectable: true },
    ],
  },
  {
    id: "sian",
    name: "시안의 시계공",
    icon: "⌛",
    accent: "#a16d37",
    cards: [
      { id: "sian-time", name: "역행 태엽", attribute: "time", damage: 22, selectable: true },
      { id: "sian-star", name: "초침별", attribute: "star", damage: 15, selectable: true },
      { id: "sian-forest", name: "녹슨 숲", attribute: "forest", damage: 13, selectable: true },
      { id: "sian-memory", name: "어제의 잠금", attribute: "memory", damage: 18, selectable: true },
    ],
  },
  {
    id: "rune",
    name: "루네의 잠수부",
    icon: "☾",
    accent: "#4c6f9f",
    cards: [
      { id: "rune-moon", name: "심해 달", attribute: "moon", damage: 19, selectable: true },
      { id: "rune-memory", name: "물결 기록", attribute: "memory", damage: 15, selectable: true },
      { id: "rune-time", name: "느린 숨", attribute: "time", damage: 17, selectable: true },
      { id: "rune-forest", name: "산호 숲", attribute: "forest", damage: 14, selectable: true },
    ],
  },
];

const playerCards = [
  { id: "player-star", name: "따라붙는 별", attribute: "star", damage: 10, selectable: true },
  { id: "player-moon", name: "반쪽 달패", attribute: "moon", damage: 8, selectable: true },
  { id: "player-forest", name: "작은 숲문", attribute: "forest", damage: 9, selectable: false },
  { id: "player-time", name: "멈춘 초침", attribute: "time", damage: 11, selectable: true },
  { id: "player-memory", name: "흐린 이름", attribute: "memory", damage: 7, selectable: false },
];

const ruleFragments = [
  "상성 카드가 항상 선택 가능한 것은 아니다",
  "빈 다섯 번째 칸은 아직 해금되지 않았다",
  "상대는 항상 먼저 카드를 고른다",
  "같은 속성은 피해를 줄일 수 있습니다",
  "기억 속성은 패배 뒤에 더 자주 나타납니다",
];

const state = {
  rewardClaimed: false,
  selectedOpponentId: null,
  opponentCard: null,
  playerCardId: null,
  defeatCount: 0,
  discoveredRules: [],
};

const characterList = document.querySelector("#characterList");
const playerHand = document.querySelector("#playerHand");
const opponentName = document.querySelector("#opponentName");
const opponentPick = document.querySelector("#opponentPick");
const playerPick = document.querySelector("#playerPick");
const battleButton = document.querySelector("#battleButton");
const rewardPanel = document.querySelector("#rewardPanel");
const rewardState = document.querySelector("#rewardState");
const defeatCount = document.querySelector("#defeatCount");
const ruleLog = document.querySelector("#ruleLog");
const toast = document.querySelector("#toast");
const resultModal = document.querySelector("#resultModal");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const resultRule = document.querySelector("#resultRule");
const closeModal = document.querySelector("#closeModal");

let toastTimer;

const getAttribute = (key) => attributes[key];

const createCardMarkup = (card, options = {}) => {
  const attribute = getAttribute(card.attribute);
  const classes = ["game-card"];

  if (options.compact) classes.push("compact");
  if (options.selected) classes.push("selected");
  if (options.disabled) classes.push("disabled");

  return `
    <button
      class="${classes.join(" ")}"
      type="button"
      style="--card-color: ${attribute.color}"
      data-card-id="${card.id}"
      ${options.disabled ? 'aria-disabled="true"' : ""}
    >
      <span class="card-symbol">${attribute.symbol}</span>
      <span class="card-name">${card.name}</span>
      <span class="card-meta">${attribute.label} · ${card.damage}</span>
    </button>
  `;
};

const createStaticCardMarkup = (card, options = {}) => {
  const attribute = getAttribute(card.attribute);
  const classes = ["game-card", "static-card"];

  if (options.summary) classes.push("summary-card");
  if (options.focus) classes.push("focus-preview");

  return `
    <div class="${classes.join(" ")}" style="--card-color: ${attribute.color}">
      <span class="card-symbol">${attribute.symbol}</span>
      <span class="card-name">${card.name}</span>
      <span class="card-meta">${attribute.label}</span>
    </div>
  `;
};

const showToast = (message) => {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
};

const getSelectedOpponent = () =>
  opponentCharacters.find((character) => character.id === state.selectedOpponentId);

const chooseOpponentCard = (character) => {
  const index = (state.defeatCount + character.id.length) % character.cards.length;
  return character.cards[index];
};

const renderCharacters = () => {
  characterList.innerHTML = opponentCharacters
    .map((character) => {
      const isSelected = character.id === state.selectedOpponentId;
      const slots = [
        ...character.cards.map((card) => createStaticCardMarkup(card, { summary: true })),
        '<div class="empty-slot"><span>?</span></div>',
      ].join("");

      return `
        <button class="character-row ${isSelected ? "selected" : ""}" type="button" data-character-id="${character.id}">
          <span class="character-icon" style="--character-color: ${character.accent}">${character.icon}</span>
          <span class="character-name">
            ${character.name}
            ${isSelected ? '<span class="current-badge">현재 상대</span>' : ""}
          </span>
          <span class="card-slots">${slots}</span>
        </button>
      `;
    })
    .join("");
};

const renderFocusCards = () => {
  const opponent = getSelectedOpponent();
  opponentName.textContent = opponent ? opponent.name : "미선택";

  if (state.opponentCard) {
    opponentPick.innerHTML = createStaticCardMarkup(state.opponentCard, { focus: true });
  } else {
    opponentPick.innerHTML = "상대를 선택하세요";
  }

  const playerCard = playerCards.find((card) => card.id === state.playerCardId);
  if (playerCard) {
    playerPick.innerHTML = createStaticCardMarkup(playerCard, { focus: true });
  } else {
    playerPick.innerHTML = "카드를 선택하세요";
  }

  battleButton.disabled = !state.playerCardId || !state.opponentCard;
  defeatCount.textContent = state.defeatCount.toString();
};

const renderPlayerHand = () => {
  playerHand.innerHTML = playerCards
    .map((card) =>
      createCardMarkup(card, {
        selected: card.id === state.playerCardId,
        disabled: !card.selectable,
      }),
    )
    .join("");
};

const renderRules = () => {
  if (state.discoveredRules.length === 0) {
    ruleLog.innerHTML = '<li class="empty-rule">아직 발견한 룰이 없습니다.</li>';
    return;
  }

  ruleLog.innerHTML = state.discoveredRules.map((rule) => `<li>${rule}</li>`).join("");
};

const renderReward = () => {
  rewardPanel.classList.toggle("claimed", state.rewardClaimed);
  rewardState.textContent = state.rewardClaimed ? "수령 완료" : "수령 가능";
};

const render = () => {
  renderReward();
  renderCharacters();
  renderPlayerHand();
  renderFocusCards();
  renderRules();
};

characterList.addEventListener("click", (event) => {
  const row = event.target.closest(".character-row");
  if (!row) return;

  const character = opponentCharacters.find((item) => item.id === row.dataset.characterId);
  state.selectedOpponentId = character.id;
  state.opponentCard = chooseOpponentCard(character);
  state.playerCardId = null;

  showToast(`${character.name}이 먼저 카드를 골랐습니다`);
  render();
});

playerHand.addEventListener("click", (event) => {
  const cardButton = event.target.closest(".game-card");
  if (!cardButton) return;

  const card = playerCards.find((item) => item.id === cardButton.dataset.cardId);
  if (!card.selectable) {
    cardButton.classList.remove("shake");
    void cardButton.offsetWidth;
    cardButton.classList.add("shake");
    showToast("아직 선택 조건을 알 수 없습니다");
    return;
  }

  if (!state.opponentCard) {
    showToast("먼저 상대를 선택하세요");
    return;
  }

  state.playerCardId = card.id;
  showToast(`${card.name} 카드를 골랐습니다`);
  render();
});

rewardPanel.addEventListener("click", () => {
  if (state.rewardClaimed) {
    showToast("이미 수령했습니다");
    return;
  }

  state.rewardClaimed = true;
  showToast("오늘의 보상을 받았습니다");
  renderReward();
});

battleButton.addEventListener("click", () => {
  if (battleButton.disabled) return;

  state.defeatCount += 1;

  const nextRule = ruleFragments[(state.defeatCount - 1) % ruleFragments.length];
  if (!state.discoveredRules.includes(nextRule)) {
    state.discoveredRules.unshift(nextRule);
  }

  resultTitle.textContent = "패배했습니다";
  resultMessage.textContent = "상대가 먼저 움직였습니다.";
  resultRule.textContent = `룰 조각을 발견했습니다: ${nextRule}`;
  resultModal.showModal();

  state.playerCardId = null;
  const opponent = getSelectedOpponent();
  if (opponent) state.opponentCard = chooseOpponentCard(opponent);
  render();
});

closeModal.addEventListener("click", () => resultModal.close());

resultModal.addEventListener("click", (event) => {
  if (event.target === resultModal) resultModal.close();
});

render();
