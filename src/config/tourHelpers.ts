export function findButtonByText(text: string): Element | null {
  const elements = document.querySelectorAll("button, a, [role='button'], summary");
  for (const btn of elements) {
    const btnText = innerText(btn);
    if (btnText.toLowerCase() === text.toLowerCase()) {
      return btn;
    }
  }
  return findButtonContainingText(text);
}

export function findButtonContainingText(text: string): Element | null {
  const elements = document.querySelectorAll("button, a, [role='button'], summary");
  for (const btn of elements) {
    const btnText = innerText(btn);
    if (btnText.includes(text.toLowerCase())) {
      return btn;
    }
  }
  return null;
}

function innerText(el: Element): string {
  return (el.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findHeadingByText(text: string): Element | null {
  const headings = document.querySelectorAll("h1, h2, h3, h4");
  for (const h of headings) {
    if ((h.textContent?.trim() || "").toLowerCase().includes(text.toLowerCase())) {
      return h;
    }
  }
  return null;
}

export function findTable(): Element | null {
  return document.querySelector("table");
}

export function findNthTable(n: number): Element | null {
  const tables = document.querySelectorAll("table");
  return tables[n] || null;
}

export function findSelectByLabel(labelText: string): Element | null {
  const selects = document.querySelectorAll("select, [role='combobox']");
  for (const sel of selects) {
    const parent = sel.closest("div, label, fieldset");
    if (parent && (parent.textContent || "").toLowerCase().includes(labelText.toLowerCase())) {
      return sel;
    }
  }
  return selects[0] || null;
}

export function findCardByTitle(title: string): Element | null {
  const cards = document.querySelectorAll("[class*='rounded-2xl'], [class*='rounded-xl']");
  for (const card of cards) {
    if ((card.textContent || "").toLowerCase().includes(title.toLowerCase())) {
      return card;
    }
  }
  return null;
}

export function findSectionByHeading(headingText: string): Element | null {
  const heading = findHeadingByText(headingText);
  if (!heading) return null;
  const section = heading.closest("[class*='rounded-2xl'], [class*='rounded-xl'], section, div");
  return section || heading.parentElement;
}

export function findCardByLabel(labelText: string): Element | null {
  const spans = document.querySelectorAll("span");
  for (const span of spans) {
    if ((span.textContent || "").trim().toLowerCase() === labelText.toLowerCase()) {
      const card = span.closest("[class*='rounded-2xl']");
      if (card) return card;
    }
  }
  return null;
}
