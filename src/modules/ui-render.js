export function setText(element, value) {
  if (element) element.textContent = value;
}

export function toggleHidden(element, hidden) {
  if (element) element.classList.toggle('hidden', Boolean(hidden));
}

export function clearElement(element) {
  if (!element) return;
  while (element.firstChild) element.removeChild(element.firstChild);
}
