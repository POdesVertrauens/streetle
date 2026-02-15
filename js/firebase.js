// firebase.js – sichere, CSP-kompatible Version

// Wenn du Firebase noch nicht eingerichtet hast, verhindern wir Fehler:
export const db = null;

export function ref() {
  console.warn("Firebase not configured.");
}
export function set() {
  console.warn("Firebase not configured.");
}
export function update() {
  console.warn("Firebase not configured.");
}
export function onValue() {
  console.warn("Firebase not configured.");
}
