function elOrFallback(el: Element | null): Element {
  return el || document.body;
}

export function findButtonByText(text: string): Element {
  const elements = document.querySelectorAll("button, a, [role='button'], summary");
  for (const btn of elements) {
    const btnText = innerText(btn);
    if (btnText.toLowerCase() === text.toLowerCase()) {
      return btn;
    }
  }
  return findButtonContainingText(text);
}

export function findButtonContainingText(text: string): Element {
  const elements = document.querySelectorAll("button, a, [role='button'], summary");
  for (const btn of elements) {
    const btnText = innerText(btn);
    if (btnText.includes(text.toLowerCase())) {
      return btn;
    }
  }
  return document.body;
}

function innerText(el: Element): string {
  return (el.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findHeadingByText(text: string): Element {
  const headings = document.querySelectorAll("h1, h2, h3, h4");
  for (const h of headings) {
    if ((h.textContent?.trim() || "").toLowerCase().includes(text.toLowerCase())) {
      return h;
    }
  }
  return document.body;
}

export function findTable(): Element {
  return elOrFallback(document.querySelector("table"));
}

export function findNthTable(n: number): Element {
  const tables = document.querySelectorAll("table");
  return tables[n] || document.body;
}

export function findSelectByLabel(labelText: string): Element {
  const selects = document.querySelectorAll("select, [role='combobox']");
  for (const sel of selects) {
    const parent = sel.closest("div, label, fieldset");
    if (parent && (parent.textContent || "").toLowerCase().includes(labelText.toLowerCase())) {
      return sel;
    }
  }
  return selects[0] || document.body;
}

export function findSectionByHeading(headingText: string): Element {
  const heading = findHeadingByText(headingText);
  if (heading === document.body) return document.body;
  const section = heading.closest("[class*='rounded-2xl'], [class*='rounded-xl'], section, div");
  return section || heading.parentElement || document.body;
}

export function findCardByLabel(labelText: string): Element {
  const spans = document.querySelectorAll("span");
  for (const span of spans) {
    if ((span.textContent || "").trim().toLowerCase() === labelText.toLowerCase()) {
      const card = span.closest("[class*='rounded-2xl']");
      if (card) return card;
    }
  }
  return document.body;
}
