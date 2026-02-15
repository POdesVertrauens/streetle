/* ============================================
   UI — Dropdown, Screens, kleine Helfer
   ============================================ */

/* --------------------------------------------
   DROPDOWN FÜR VORSCHLÄGE
-------------------------------------------- */
export function setupSuggestions(inputEl, dropdownEl, allNames) {
  inputEl.addEventListener("input", () => {
    const query = inputEl.value.toLowerCase().trim();
    dropdownEl.innerHTML = "";

    if (!query) return;

    const matches = allNames
      .filter(n => n.toLowerCase().includes(query))
      .slice(0, 10);

    matches.forEach(name => {
      const div = document.createElement("div");
      div.textContent = name;
      div.onclick = () => {
        inputEl.value = name;
        dropdownEl.innerHTML = "";
      };
      dropdownEl.appendChild(div);
    });
  });
}

/* --------------------------------------------
   SCREEN WECHSELN
-------------------------------------------- */
export function show(el) {
  el.style.display = "block";
}

export function hide(el) {
  el.style.display = "none";
}

/* --------------------------------------------
   TEXT SETZEN
-------------------------------------------- */
export function setText(el, text) {
  el.textContent = text;
}
