document.head.insertAdjacentHTML(
  "beforeend",
  `
    <style>
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            backdrop-filter: blur(20px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 1000;
        }

        .overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .search-container {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            width: 90%;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 0;
        }

        .overlay.active .search-container {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .search-input {
            width: 100%;
            padding: 20px 24px;
            font-size: 18px;
            border: none;
            background: transparent;
            outline: none;
            color: #333;
            border-radius: 16px 16px 0 0;
        }

        .search-input::placeholder {
            color: #999;
        }

        .results {
            max-height: 400px;
            overflow-y: auto;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .result-item {
            padding: 16px 24px;
            cursor: pointer;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .result-item:hover,
        .result-item.selected {
            background: rgba(103, 126, 234, 0.1);
        }

        .result-item:last-child {
            border-bottom: none;
            border-radius: 0 0 16px 16px;
        }

        .result-icon {
            width: 24px;
            height: 24px;
            background: var(--accent);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text);
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
        }

        .result-content {
            flex: 1;
        }

        .result-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
        }

        .result-subtitle {
            font-size: 14px;
            color: #666;
        }

        .empty-state {
            padding: 40px 24px;
            text-align: center;
            color: #666;
            font-size: 16px;
        }

        .no-results {
            padding: 20px 24px;
            text-align: center;
            color: #999;
            font-style: italic;
        }

        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.3);
        }
    </style>
`,
);
let overlay, searchInput, results;
let selectedIndex = -1;
let appsData = [];
let filteredData = [];
async function createSearchInterface() {
  overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.id = "searchOverlay";
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";
  searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-input";
  searchInput.id = "searchInput";
  searchInput.placeholder = "QuickLaunch";
  results = document.createElement("div");
  results.className = "results";
  results.id = "results";
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(results);
  overlay.appendChild(searchContainer);
  document.body.appendChild(overlay);
  appsData = await generateApps();
  attachEventListeners();
}

function attachEventListeners() {
  searchInput.addEventListener("input", (e) => {
    search(e.target.value);
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeSearch();
    }
  });

  results.addEventListener("click", (e) => {
    const item = e.target.closest(".result-item");
    if (item) {
      const index = parseInt(item.dataset.index);
      selectItem(index);
    }
  });

  results.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".result-item");
    if (item) {
      selectedIndex = parseInt(item.dataset.index);
      updateSelection();
    }
  });
}

function openSearch() {
  if (!overlay) {
    createSearchInterface();
  }
  overlay.classList.add("active");
  setTimeout(() => {
    searchInput.focus();
  }, 100);
  searchInput.value = "";
  selectedIndex = -1;
}

function closeSearch() {
  if (overlay) {
    overlay.classList.remove("active");
    searchInput.blur();
  }
}

function showNoResults() {
  results.innerHTML = '<div class="no-results"></div>';
}

function search(query) {
  if (!query.trim()) {
    showNoResults();
    return;
  }

  filteredData = appsData.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  );

  if (filteredData.length === 0) {
    showNoResults();
    return;
  }

  results.innerHTML = filteredData
    .map(
      (item, index) => `
                <div class="result-item" data-index="${index}">
                    <div class="result-icon">${item.icon}</div>
                    <div class="result-content">
                        <div class="result-title">${item.title}</div>
                        <div class="result-subtitle">${item.subtitle}</div>
                    </div>
                </div>
            `,
    )
    .join("");
  selectedIndex = -1;
  updateSelection();
}

function updateSelection() {
  const items = results.querySelectorAll(".result-item");
  items.forEach((item, index) => {
    item.classList.toggle("selected", index === selectedIndex);
  });
}

function scrollToSelected() {
  const selectedItem = results.querySelector(".result-item.selected");
  if (selectedItem) {
    selectedItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}

function selectItem(index) {
  const items = results.querySelectorAll(".result-item");
  if (items[index]) {
    const title = items[index].querySelector(".result-title").textContent;
    eval(filteredData[index].function);
    closeSearch();
  }
}

document.addEventListener("keydown", (e) => {
  if (localStorage.getItem("quicklaunch.keyboardshortcut") === null) {
    localStorage.setItem("quicklaunch.keyboardshortcut", "meta+k");
  }

  document.addEventListener("keydown", function (e) {
    const shortcut = localStorage.getItem("quicklaunch.keyboardshortcut");
    const isMeta = shortcut.startsWith("meta+");
    const key = shortcut.replace("meta+", "");
    if (
      (isMeta ? e.metaKey || e.ctrlKey : true) &&
      e.key.toLowerCase() === key.toLowerCase()
    ) {
      e.preventDefault();
      if (overlay && overlay.classList.contains("active")) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  });

  if (!overlay || !overlay.classList.contains("active")) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeSearch();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const items = results.querySelectorAll(".result-item");
    if (items.length > 0) {
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection();
      scrollToSelected();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, -1);
    updateSelection();
    scrollToSelected();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (selectedIndex >= 0) {
      selectItem(selectedIndex);
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const items = results.querySelectorAll(".result-item");
    if (items.length > 0) {
      if (e.shiftKey) {
        selectedIndex =
          selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
      } else {
        selectedIndex =
          selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1;
      }
      updateSelection();
      scrollToSelected();
    }
  }
});
