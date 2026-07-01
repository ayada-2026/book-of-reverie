const maxTurns = 5;
const winBookmarks = 3;
const loseBlur = 3;

const attributes = {
  star: { label: "별", symbol: "*", color: "#7867b8" },
  moon: { label: "달", symbol: "C", color: "#4c6f9f" },
  forest: { label: "숲", symbol: "F", color: "#3f7b58" },
  time: { label: "시간", symbol: "T", color: "#9a6b36" },
  memory: { label: "기억", symbol: "M", color: "#a04f6f" },
  void: { label: "무속성", symbol: "?", color: "#8a7a66" },
};

const cardTypes = {
  affinity: { label: "상성형", note: "기억을 상대할 때 추가 +3" },
  defense: { label: "방어형", note: "3점 차 패배까지 버팀으로 바꿈" },
  observe: { label: "관찰형", note: "상대 정보를 기록하고 다음 힌트를 강화" },
  attack: { label: "공격형", note: "불리가 아니면 +2, 불리한 패배는 흐림 추가" },
  trick: { label: "변칙형", note: "상대 공개 뒤 후보 속성 중 하나로 변함" },
};

const advantageMap = {
  star: "memory",
  memory: "time",
  time: "forest",
  forest: "moon",
  moon: "star",
};

const poeticRules = [
  "별은 기억을 비춘다",
  "기억은 시간을 붙잡는다",
  "시간은 숲을 멈춘다",
  "숲은 달을 가린다",
  "달은 별을 삼킨다",
];

const hiddenEffects = {
  inkVeil: {
    label: "잉크 장막",
    text: "상성 우위를 1점 흐리게 만듭니다.",
  },
  firstTempo: {
    label: "선행 박자",
    text: "상대가 먼저 움직여 힘을 1점 더합니다.",
  },
  memoryWeight: {
    label: "기억의 무게",
    text: "기억 카드의 힘이 높은 편입니다.",
  },
  moonShell: {
    label: "달껍질",
    text: "버팀 판정이 조금 더 어려워집니다.",
  },
  deepPulse: {
    label: "심층 맥동",
    text: "5번째 심층 카드가 흐림을 강하게 끌어옵니다.",
  },
};

const opponentCharacters = [
  {
    id: "mira",
    name: "미라의 서기관",
    icon: "S",
    accent: "#7b5ea7",
    tendency: "기억 중심. 별 카드가 좋지만 시간 카드로 속일 때도 있음",
    shownTendency: "기억 / 별",
    cards: [
      { id: "mira-star", name: "유성 잉크", attribute: "star", damage: 16, effect: "inkVeil" },
      { id: "mira-moon", name: "달빛 장부", attribute: "moon", damage: 14, effect: "moonShell" },
      { id: "mira-time", name: "접힌 시각", attribute: "time", damage: 17, effect: "firstTempo" },
      { id: "mira-memory", name: "지워진 행", attribute: "memory", damage: 17, effect: "memoryWeight" },
    ],
    deepCard: { id: "mira-deep", name: "검은 여백", attribute: "memory", damage: 19, effect: "deepPulse", deep: true },
  },
  {
    id: "noa",
    name: "노아의 정원사",
    icon: "F",
    accent: "#3f7b58",
    tendency: "숲/달 중심. 방어적이라 천천히 밀어야 함",
    shownTendency: "숲 / 달",
    cards: [
      { id: "noa-forest", name: "잠든 덩굴", attribute: "forest", damage: 16, effect: "inkVeil" },
      { id: "noa-star", name: "별씨앗", attribute: "star", damage: 12, effect: "firstTempo" },
      { id: "noa-memory", name: "흙의 기억", attribute: "memory", damage: 17, effect: "memoryWeight" },
      { id: "noa-moon", name: "젖은 달잎", attribute: "moon", damage: 15, effect: "moonShell" },
    ],
    deepCard: { id: "noa-deep", name: "뿌리 밑 꿈", attribute: "forest", damage: 18, effect: "deepPulse", deep: true },
  },
  {
    id: "sian",
    name: "시안의 시계공",
    icon: "T",
    accent: "#a16d37",
    tendency: "시간 중심. 잘못 맞으면 흐림이 빨리 쌓임",
    shownTendency: "시간",
    cards: [
      { id: "sian-time", name: "역행 태엽", attribute: "time", damage: 18, effect: "firstTempo" },
      { id: "sian-star", name: "초침별", attribute: "star", damage: 15, effect: "inkVeil" },
      { id: "sian-forest", name: "녹슨 숲", attribute: "forest", damage: 13, effect: "moonShell" },
      { id: "sian-memory", name: "어제의 잠금", attribute: "memory", damage: 18, effect: "memoryWeight" },
    ],
    deepCard: { id: "sian-deep", name: "무음 시계", attribute: "time", damage: 20, effect: "deepPulse", deep: true },
  },
  {
    id: "rune",
    name: "루네의 잠수부",
    icon: "C",
    accent: "#4c6f9f",
    tendency: "달/기억 중심. 변칙 카드가 많아 관찰형이 유리함",
    shownTendency: "달 / 기억",
    cards: [
      { id: "rune-moon", name: "심해 달", attribute: "moon", damage: 18, effect: "moonShell" },
      { id: "rune-memory", name: "물결 기록", attribute: "memory", damage: 15, effect: "inkVeil" },
      { id: "rune-time", name: "느린 숨", attribute: "time", damage: 17, effect: "firstTempo" },
      { id: "rune-forest", name: "산호 숲", attribute: "forest", damage: 14, effect: "moonShell" },
    ],
    deepCard: { id: "rune-deep", name: "물밑 이름", attribute: "moon", damage: 19, effect: "deepPulse", deep: true },
  },
];

const playerCards = [
  { id: "player-star", name: "따라붙는 별", attribute: "star", damage: 16, type: "affinity", hint: "기억을 상대할 때 추가 +3" },
  { id: "player-moon", name: "반쪽 달패", attribute: "moon", damage: 15, type: "defense", hint: "3점 차 패배까지 버팀" },
  { id: "player-forest", name: "작은 숲문", attribute: "forest", damage: 13, type: "observe", hint: "전투 후 상대 정보 기록" },
  { id: "player-time", name: "멈춘 초침", attribute: "time", damage: 16, type: "attack", hint: "불리가 아니면 +2" },
  { id: "player-margin", name: "꿈의 여백", attribute: "void", damage: 12, type: "trick", hint: "책갈피 2개 또는 보너스 카드로 사용" },
];

const ruleHints = {
  same: "같은 속성은 버티기에 도움이 된다.",
  hiddenInfo: "전투 전에는 상대 카드의 이름과 힘을 알 수 없다.",
  observe: "관찰형 카드는 상대 카드와 효과를 기록한다.",
  highDamage: "점수 높은 카드가 항상 좋은 선택은 아니다.",
  hiddenBlock: "상성 우위라도 숨은 효과에 막힐 수 있다.",
  fifthSlot: "다섯 번째 슬롯은 심층 카드나 보너스 카드 자리다.",
  deepOpen: "흐림 2개 또는 5턴째에는 상대의 심층 카드가 열릴 수 있다.",
};

const state = {
  rewardClaimed: false,
  hintTickets: 0,
  bonusCards: 0,
  selectedOpponentId: null,
  opponentCard: null,
  previewAttributes: [],
  hintRevealed: false,
  enhancedHint: false,
  selectedPlayerCardId: null,
  usedCardIds: [],
  turn: 0,
  bookmarks: 0,
  blur: 0,
  matchOver: true,
  matchOutcome: null,
  discoveredRules: [],
};

const characterList = document.querySelector("#characterList");
const playerHand = document.querySelector("#playerHand");
const opponentName = document.querySelector("#opponentName");
const opponentPick = document.querySelector("#opponentPick");
const playerPick = document.querySelector("#playerPick");
const battleButton = document.querySelector("#battleButton");
const hintButton = document.querySelector("#hintButton");
const rewardPanel = document.querySelector("#rewardPanel");
const rewardState = document.querySelector("#rewardState");
const turnCount = document.querySelector("#turnCount");
const bookmarkCount = document.querySelector("#bookmarkCount");
const blurCount = document.querySelector("#blurCount");
const hintCount = document.querySelector("#hintCount");
const bonusCount = document.querySelector("#bonusCount");
const matchStatus = document.querySelector("#matchStatus");
const ruleLog = document.querySelector("#ruleLog");
const toast = document.querySelector("#toast");
const resultModal = document.querySelector("#resultModal");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const resultRule = document.querySelector("#resultRule");
const closeModal = document.querySelector("#closeModal");

let toastTimer;

const getAttribute = (key) => attributes[key];
const getCardType = (key) => cardTypes[key];
const getHiddenEffect = (key) => hiddenEffects[key];
const getSelectedOpponent = () =>
  opponentCharacters.find((character) => character.id === state.selectedOpponentId);

const addDiscoveredRule = (rule) => {
  if (!state.discoveredRules.includes(rule)) state.discoveredRules.unshift(rule);
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const getAffinity = (playerAttribute, opponentAttribute) => {
  if (playerAttribute === "void") return "neutral";
  if (playerAttribute === opponentAttribute) return "same";
  if (advantageMap[playerAttribute] === opponentAttribute) return "strong";
  if (advantageMap[opponentAttribute] === playerAttribute) return "weak";
  return "neutral";
};

const getAdvantageText = (attackerAttribute) =>
  `${getAttribute(attackerAttribute).label}은 ${getAttribute(advantageMap[attackerAttribute]).label}에 강하다.`;

const getPowerTier = (damage) => {
  if (damage >= 18) return "강함";
  if (damage >= 15) return "중간";
  return "낮음";
};

const createPreviewAttributes = (actualAttribute) => {
  const otherAttributes = Object.keys(advantageMap).filter((attribute) => attribute !== actualAttribute);
  return shuffle([actualAttribute, pickRandom(otherAttributes)]);
};

const isOpponentDeepOpen = () => state.blur >= 2 || state.turn >= maxTurns;
const isDreamMarginOpen = () => state.bookmarks >= 2 || state.bonusCards > 0;

const chooseOpponentCard = () => {
  const opponent = getSelectedOpponent();
  if (!opponent) return;

  const pool = isOpponentDeepOpen() ? [...opponent.cards, opponent.deepCard] : opponent.cards;
  state.opponentCard = pickRandom(pool);
  state.previewAttributes = createPreviewAttributes(state.opponentCard.attribute);
  state.hintRevealed = false;
  addDiscoveredRule(ruleHints.hiddenInfo);
  if (isOpponentDeepOpen()) addDiscoveredRule(ruleHints.deepOpen);
};

const showToast = (message) => {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
};

const resetMatch = (opponentId) => {
  state.selectedOpponentId = opponentId;
  state.selectedPlayerCardId = null;
  state.usedCardIds = [];
  state.turn = 1;
  state.bookmarks = 0;
  state.blur = 0;
  state.matchOver = false;
  state.matchOutcome = null;
  state.enhancedHint = false;
  chooseOpponentCard();
};

const resolvePlayerAttribute = (playerCard, opponentCard) => {
  if (playerCard.id !== "player-margin") return playerCard.attribute;

  const bestCandidate = state.previewAttributes.find(
    (candidate) => advantageMap[candidate] === opponentCard.attribute,
  );

  return bestCandidate ?? state.previewAttributes[0] ?? "void";
};

const getAttributeAdjustment = (affinity) => {
  if (affinity === "strong") return 4;
  if (affinity === "same") return 1;
  if (affinity === "weak") return -3;
  return 0;
};

const applyHiddenEffect = (battle, opponentCard) => {
  if (opponentCard.effect === "inkVeil" && battle.affinity === "strong") {
    battle.playerScore -= 1;
    battle.steps.push("숨은 효과: 잉크 장막이 상성 보정을 1점 줄였습니다.");
  }

  if (opponentCard.effect === "firstTempo") {
    battle.opponentScore += 1;
    battle.steps.push("숨은 효과: 선행 박자로 상대 힘이 1점 올랐습니다.");
  }

  if (opponentCard.effect === "moonShell" && battle.playerCard.type === "defense") {
    battle.defenseWindow -= 1;
    battle.steps.push("숨은 효과: 달껍질 때문에 방어형의 버팀 폭이 1점 줄었습니다.");
  }

  if (opponentCard.effect === "deepPulse") {
    battle.opponentScore += 2;
    battle.steps.push("숨은 효과: 심층 맥동으로 상대 힘이 2점 올랐습니다.");
  }
};

const applyRoleEffect = (battle) => {
  const { playerCard, opponentCard } = battle;

  if (playerCard.type === "affinity" && playerCard.attribute === "star" && opponentCard.attribute === "memory") {
    battle.playerScore += 3;
    battle.steps.push("역할 효과: 따라붙는 별이 기억을 비춰 3점을 얻었습니다.");
  }

  if (playerCard.type === "attack" && battle.affinity !== "weak") {
    battle.playerScore += 2;
    battle.steps.push("역할 효과: 공격형 카드가 불리하지 않아 2점을 얻었습니다.");
  }

  if (playerCard.type === "trick") {
    battle.steps.push(`역할 효과: 꿈의 여백이 ${getAttribute(battle.resolvedAttribute).label} 기운으로 변했습니다.`);
    if (battle.affinity === "weak") {
      battle.playerScore += 3;
      battle.affinity = "neutral";
      battle.steps.push("역할 효과: 변칙형 카드가 상성 불리 보정 -3을 한 번 무시했습니다.");
    }
  }
};

const calculateBattle = (playerCard, opponentCard) => {
  const resolvedAttribute = resolvePlayerAttribute(playerCard, opponentCard);
  const affinity = getAffinity(resolvedAttribute, opponentCard.attribute);
  const attributeAdjustment = getAttributeAdjustment(affinity);
  const battle = {
    playerCard,
    opponentCard,
    resolvedAttribute,
    affinity,
    attributeAdjustment,
    playerScore: playerCard.damage + attributeAdjustment,
    opponentScore: opponentCard.damage,
    defenseWindow: 3,
    outcome: "defeat",
    bookmarkGain: 0,
    blurGain: 0,
    hintGain: 0,
    steps: [
      `기본 힘: 내 카드 ${playerCard.damage}, 상대 카드 ${opponentCard.damage}`,
      `속성 보정: ${attributeAdjustment > 0 ? "+" : ""}${attributeAdjustment}`,
    ],
  };

  applyRoleEffect(battle);
  applyHiddenEffect(battle, opponentCard);

  if (battle.playerScore > battle.opponentScore) {
    battle.outcome = "victory";
    battle.bookmarkGain = battle.playerScore - battle.opponentScore >= 5 ? 2 : 1;
  } else if (battle.playerScore === battle.opponentScore) {
    battle.outcome = "draw";
    battle.hintGain = 1;
  } else {
    const gap = battle.opponentScore - battle.playerScore;
    if (playerCard.type === "defense" && gap <= battle.defenseWindow) {
      battle.outcome = "draw";
      battle.hintGain = 1;
      battle.steps.push(`역할 효과: 반쪽 달패가 ${gap}점 차 패배를 버팀으로 바꿨습니다.`);
    } else {
      battle.outcome = "defeat";
      battle.blurGain = 1;
    }
  }

  if (playerCard.type === "attack" && battle.affinity === "weak" && battle.outcome === "defeat") {
    battle.blurGain += 1;
    battle.steps.push("역할 위험: 공격형 카드가 상성 불리로 져서 흐림이 1개 더 쌓였습니다.");
  }

  if (playerCard.type === "observe") {
    state.enhancedHint = true;
    battle.steps.push("역할 효과: 작은 숲문이 다음 턴 힌트를 강화합니다.");
  }

  return battle;
};

const updateMatchProgress = (battle) => {
  state.bookmarks += battle.bookmarkGain;
  state.blur += battle.blurGain;
  state.hintTickets += battle.hintGain;

  if (state.bookmarks >= winBookmarks) {
    state.matchOver = true;
    state.matchOutcome = "victory";
  }

  if (state.blur >= loseBlur) {
    state.matchOver = true;
    state.matchOutcome = "defeat";
  }

  if (!state.matchOver && state.turn >= maxTurns) {
    state.matchOver = true;
    state.matchOutcome = state.bookmarks >= state.blur ? "victory" : "defeat";
  }
};

const discoverRules = (battle) => {
  if (battle.affinity === "strong") addDiscoveredRule(getAdvantageText(battle.resolvedAttribute));
  if (battle.affinity === "same") addDiscoveredRule(ruleHints.same);
  if (battle.affinity === "weak") addDiscoveredRule(getAdvantageText(battle.opponentCard.attribute));
  if (battle.playerCard.type === "observe") addDiscoveredRule(ruleHints.observe);
  if (battle.playerCard.type === "attack" && battle.affinity === "weak") addDiscoveredRule(ruleHints.highDamage);
  if (battle.steps.some((step) => step.includes("숨은 효과"))) addDiscoveredRule(ruleHints.hiddenBlock);
  addDiscoveredRule(ruleHints.fifthSlot);
};

const isCardAvailable = (card) => {
  if (state.usedCardIds.includes(card.id)) return false;
  if (card.id === "player-margin") return isDreamMarginOpen();
  return true;
};

const createCardMarkup = (card, options = {}) => {
  const attribute = getAttribute(card.attribute);
  const type = getCardType(card.type);
  const available = isCardAvailable(card);
  const classes = ["game-card"];

  if (options.selected) classes.push("selected");
  if (!available || options.used) classes.push("used");

  const hint = options.used
    ? "사용 완료"
    : card.id === "player-margin" && !available
      ? "책갈피 2개 또는 보너스 카드 필요"
      : card.hint;

  return `
    <button
      class="${classes.join(" ")}"
      type="button"
      style="--card-color: ${attribute.color}"
      data-card-id="${card.id}"
      ${!available || state.matchOver ? 'disabled aria-disabled="true"' : ""}
    >
      <span class="type-badge">${type.label}</span>
      <span class="card-symbol">${attribute.symbol}</span>
      <span class="card-name">${card.name}</span>
      <span class="card-meta">${attribute.label} · 힘 ${card.damage}</span>
      <span class="card-hint">${hint}</span>
    </button>
  `;
};

const createStaticCardMarkup = (card, options = {}) => {
  const attribute = getAttribute(card.attribute);
  const classes = ["game-card", "static-card"];
  const metaText = options.summary ? attribute.label : `${attribute.label} · 힘 ${card.damage}`;

  if (options.summary) classes.push("summary-card");
  if (options.focus) classes.push("focus-preview");

  return `
    <div class="${classes.join(" ")}" style="--card-color: ${attribute.color}" data-card-id="${card.id}" data-attribute="${card.attribute}">
      <span class="card-symbol">${attribute.symbol}</span>
      <span class="card-name">${card.name}</span>
      <span class="card-meta">${metaText}</span>
    </div>
  `;
};

const createOpponentPreviewMarkup = () => {
  const candidates = state.hintRevealed
    ? getAttribute(state.opponentCard.attribute).label
    : state.previewAttributes.map((key) => getAttribute(key).label).join(" 또는 ");
  const hintLine = state.enhancedHint && !state.hintRevealed
    ? `<span class="preview-line">관찰됨: ${getAttribute(state.opponentCard.attribute).label} 쪽으로 기울어 있음</span>`
    : "";

  return `
    <div class="opponent-preview" style="--card-color: #8a7a66">
      <span class="card-symbol">?</span>
      <span class="masked-name">정확한 카드는 전투 후 드러납니다</span>
      <span class="preview-line">기운: ${candidates}</span>
      <span class="preview-line">힘: ${getPowerTier(state.opponentCard.damage)}</span>
      <span class="preview-line">효과: 알 수 없음</span>
      ${hintLine}
    </div>
  `;
};

const createFifthSlotMarkup = (isOpen) =>
  isOpen
    ? '<div class="empty-slot hinted open"><span>심층<br />개방</span></div>'
    : '<div class="empty-slot hinted"><span>심층<br />잠김</span></div>';

const renderReward = () => {
  rewardPanel.classList.toggle("claimed", state.rewardClaimed);
  rewardState.textContent = state.rewardClaimed ? "수령 완료" : "수령 가능";
};

const renderCharacters = () => {
  characterList.innerHTML = opponentCharacters
    .map((character) => {
      const isSelected = character.id === state.selectedOpponentId;
      const deepOpen = isSelected && isOpponentDeepOpen();
      const slots = [
        ...character.cards.map((card) => createStaticCardMarkup(card, { summary: true })),
        createFifthSlotMarkup(deepOpen),
      ].join("");

      return `
        <button class="character-row ${isSelected ? "selected" : ""}" type="button" data-character-id="${character.id}">
          <span class="character-icon" style="--character-color: ${character.accent}">${character.icon}</span>
          <span class="character-name">
            ${character.name}
            <span class="tendency">성향: ${character.shownTendency}</span>
            <span class="tendency">${character.tendency}</span>
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
  opponentPick.innerHTML = state.opponentCard ? createOpponentPreviewMarkup() : "상대를 선택하세요";

  const playerCard = playerCards.find((card) => card.id === state.selectedPlayerCardId);
  playerPick.innerHTML = playerCard ? createStaticCardMarkup(playerCard, { focus: true }) : "카드를 선택하세요";
};

const renderPlayerHand = () => {
  playerHand.innerHTML = playerCards
    .map((card) =>
      createCardMarkup(card, {
        selected: card.id === state.selectedPlayerCardId,
        used: state.usedCardIds.includes(card.id),
      }),
    )
    .join("");
};

const renderStats = () => {
  turnCount.textContent = state.matchOver && state.turn === 0 ? "0/5" : `${state.turn}/${maxTurns}`;
  bookmarkCount.textContent = state.bookmarks.toString();
  blurCount.textContent = state.blur.toString();
  hintCount.textContent = state.hintTickets.toString();
  bonusCount.textContent = state.bonusCards.toString();

  if (!state.selectedOpponentId) {
    matchStatus.textContent = "상대를 고르면 최대 5턴의 전투가 시작됩니다.";
  } else if (state.matchOver) {
    matchStatus.textContent =
      state.matchOutcome === "victory"
        ? "전투 종료: 책갈피가 모였습니다. 새 상대를 고르면 다시 시작합니다."
        : "전투 종료: 흐림이 짙어졌습니다. 새 상대를 고르면 다시 시작합니다.";
  } else {
    matchStatus.textContent = "책갈피 3개를 먼저 모으면 승리, 흐림 3개가 쌓이면 패배합니다.";
  }

  battleButton.disabled = state.matchOver || !state.selectedPlayerCardId || !state.opponentCard;
  hintButton.disabled = state.matchOver || !state.opponentCard || state.hintTickets <= 0 || state.hintRevealed;
};

const renderRules = () => {
  if (state.discoveredRules.length === 0) {
    ruleLog.innerHTML = '<li class="empty-rule">아직 발견한 룰이 없습니다.</li>';
    return;
  }

  ruleLog.innerHTML = state.discoveredRules.map((rule) => `<li>${rule}</li>`).join("");
};

const render = () => {
  renderReward();
  renderCharacters();
  renderFocusCards();
  renderPlayerHand();
  renderStats();
  renderRules();
};

const getTurnTitle = (battle) => {
  if (state.matchOver && state.matchOutcome === "victory") return "전투에서 승리했습니다";
  if (state.matchOver && state.matchOutcome === "defeat") return "전투에서 패배했습니다";
  if (battle.outcome === "victory") return "승리했습니다";
  if (battle.outcome === "draw") return "버텼습니다";
  return "패배했습니다";
};

const getOutcomeChangeText = (battle) => {
  if (battle.outcome === "victory") return `책갈피 +${battle.bookmarkGain}`;
  if (battle.outcome === "draw") return "힌트 +1";
  return `흐림 +${battle.blurGain}`;
};

const getResultSummary = (battle) => {
  const playerAttribute = getAttribute(battle.resolvedAttribute).label;
  const opponentAttribute = getAttribute(battle.opponentCard.attribute).label;
  const hiddenEffectChangedScore = battle.steps.some((step) => step.includes("숨은 효과"));
  const defenseSavedTurn = battle.steps.some((step) => step.includes("버팀으로 바꿨습니다"));

  if (defenseSavedTurn) return "반쪽 달패가 작은 패배를 버팀으로 바꿨습니다.";
  if (battle.outcome === "victory" && battle.affinity === "strong") {
    return `${playerAttribute}의 흐름이 ${opponentAttribute}을 눌렀습니다.`;
  }
  if (battle.outcome === "defeat" && hiddenEffectChangedScore) {
    return "상대의 숨은 효과로 힘 차이가 벌어졌습니다.";
  }
  if (battle.outcome === "draw") return "서로의 기운이 맞물려 간신히 버텼습니다.";
  if (battle.outcome === "victory") return `${battle.playerCard.name}이 힘의 균형을 가져왔습니다.`;
  return "상대의 기운을 끝까지 읽지 못했습니다.";
};

const buildAttributeReason = (battle) => {
  if (battle.affinity === "strong") return `${getAttribute(battle.resolvedAttribute).label}은 ${getAttribute(battle.opponentCard.attribute).label}에 강함: +4`;
  if (battle.affinity === "same") return `같은 속성: +1`;
  if (battle.affinity === "weak") return `${getAttribute(battle.resolvedAttribute).label}은 ${getAttribute(battle.opponentCard.attribute).label}에 불리함: -3`;
  return "상성 관계 없음: 0";
};

const buildResultMarkup = (battle) => {
  const effect = getHiddenEffect(battle.opponentCard.effect);
  const steps = battle.steps.map((step) => `<li>${step}</li>`).join("");
  const outcomeText = getOutcomeChangeText(battle);
  const summary = getResultSummary(battle);

  return `
    <div class="result-summary">
      <div class="result-change">${outcomeText}</div>
      <dl class="simple-result-list">
        <div><dt>상대 카드</dt><dd>${battle.opponentCard.name}</dd></div>
        <div><dt>내 카드</dt><dd>${battle.playerCard.name}</dd></div>
      </dl>
      <p class="result-one-line">${summary}</p>
    </div>
    <details class="calculation-details">
      <summary>상세 계산 보기</summary>
      <dl class="reveal-list">
        <div><dt>상대 카드</dt><dd>${battle.opponentCard.name} / ${getAttribute(battle.opponentCard.attribute).label} / 힘 ${battle.opponentCard.damage}</dd></div>
        <div><dt>내 카드</dt><dd>${battle.playerCard.name} / ${getAttribute(battle.resolvedAttribute).label} / 힘 ${battle.playerCard.damage}</dd></div>
        <div><dt>속성 보정</dt><dd>${buildAttributeReason(battle)}</dd></div>
        <div><dt>숨은 효과</dt><dd>${effect.label}: ${effect.text}</dd></div>
        <div><dt>최종 점수</dt><dd>내 점수 ${battle.playerScore} / 상대 점수 ${battle.opponentScore}</dd></div>
      </dl>
      <ul class="result-reasons">${steps}</ul>
    </details>
  `;
};

const advanceTurn = () => {
  if (!state.matchOver) {
    state.turn += 1;
    state.selectedPlayerCardId = null;
    chooseOpponentCard();
    return;
  }

  state.selectedPlayerCardId = null;
};

characterList.addEventListener("click", (event) => {
  const row = event.target.closest(".character-row");
  if (!row) return;

  resetMatch(row.dataset.characterId);
  showToast(`${getSelectedOpponent().name}과 전투를 시작합니다`);
  render();
});

playerHand.addEventListener("click", (event) => {
  const cardButton = event.target.closest(".game-card");
  if (!cardButton) return;

  const card = playerCards.find((item) => item.id === cardButton.dataset.cardId);
  if (state.matchOver) {
    showToast("먼저 상대를 선택하세요");
    return;
  }

  if (!isCardAvailable(card)) {
    showToast(card.id === "player-margin" ? "아직 다섯 번째 카드 조건이 열리지 않았습니다" : "이번 전투에서 이미 사용한 카드입니다");
    return;
  }

  state.selectedPlayerCardId = card.id;
  showToast(`${card.name} 카드를 골랐습니다`);
  render();
});

hintButton.addEventListener("click", () => {
  if (hintButton.disabled) return;

  state.hintTickets -= 1;
  state.hintRevealed = true;
  showToast("상대 카드의 진짜 기운을 확인했습니다");
  render();
});

rewardPanel.addEventListener("click", () => {
  if (state.rewardClaimed) {
    showToast("이미 수령했습니다");
    return;
  }

  state.rewardClaimed = true;
  state.hintTickets += 1;
  state.bonusCards += 1;
  showToast("오늘의 보상: 힌트권 +1, 보너스 카드 +1");
  render();
});

battleButton.addEventListener("click", () => {
  if (battleButton.disabled) return;

  const playerCard = playerCards.find((card) => card.id === state.selectedPlayerCardId);
  const opponentCard = state.opponentCard;
  const usedBonusMargin = playerCard.id === "player-margin" && state.bookmarks < 2 && state.bonusCards > 0;
  state.enhancedHint = false;
  const battle = calculateBattle(playerCard, opponentCard);

  if (usedBonusMargin) state.bonusCards -= 1;

  state.usedCardIds.push(playerCard.id);
  discoverRules(battle);
  updateMatchProgress(battle);

  resultTitle.textContent = getTurnTitle(battle);
  resultMessage.textContent = `책갈피 ${state.bookmarks} / 흐림 ${state.blur}`;
  resultRule.innerHTML = buildResultMarkup(battle);
  resultModal.showModal();

  advanceTurn();
  render();
});

closeModal.addEventListener("click", () => resultModal.close());

resultModal.addEventListener("click", (event) => {
  if (event.target === resultModal) resultModal.close();
});

render();
