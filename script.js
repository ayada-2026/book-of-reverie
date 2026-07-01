const storageKey = "book-of-reverie.entries";

const entryForm = document.querySelector("#entryForm");
const entryTitle = document.querySelector("#entryTitle");
const entryBody = document.querySelector("#entryBody");
const entryList = document.querySelector("#entryList");

const loadEntries = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(storageKey, JSON.stringify(entries));
};

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const renderEntries = () => {
  const entries = loadEntries();

  if (entries.length === 0) {
    entryList.innerHTML = '<p class="empty-state">아직 기록이 없습니다.</p>';
    return;
  }

  entryList.innerHTML = entries
    .map(
      (entry) => `
        <article class="entry-card">
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.body)}</p>
          <time datetime="${entry.createdAt}">${formatDate(entry.createdAt)}</time>
        </article>
      `,
    )
    .join("");
};

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = entryTitle.value.trim() || "제목 없는 기록";
  const body = entryBody.value.trim();

  if (!body) {
    entryBody.focus();
    return;
  }

  const entries = loadEntries();
  entries.unshift({
    title,
    body,
    createdAt: new Date().toISOString(),
  });

  saveEntries(entries);
  entryForm.reset();
  entryTitle.focus();
  renderEntries();
});

renderEntries();
