/* ============================================
   UI — Dropdown Vorschläge
   ============================================ */

export function setupSuggestions(inputEl, dropdownEl, allNames, onSelect) {
  inputEl.addEventListener("input", () => {
    const query = inputEl.value.toLowerCase().trim();
    dropdownEl.innerHTML = "";

    if (!query || query.length < 2) return;

    const matches = allNames
      .filter(n => n.toLowerCase().includes(query))
      .slice(0, 10);

    matches.forEach(name => {
      const div = document.createElement("div");
      div.textContent = name;
      div.style.padding = "6px 10px";
      div.style.cursor = "pointer";
      div.onmouseenter = () => div.style.background = "#f0f0f0";
      div.onmouseleave = () => div.style.background = "white";
      div.onclick = () => {
        inputEl.value = name;
        dropdownEl.innerHTML = "";
        if (onSelect) onSelect(name);
      };
      dropdownEl.appendChild(div);
    });
  });

  // Dropdown schließen wenn woanders geklickt wird
  document.addEventListener("click", (e) => {
    if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
      dropdownEl.innerHTML = "";
    }
  });
}
