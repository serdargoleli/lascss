import postcss, { AtRule, Rule } from "postcss";

function extractClasses(selector: string): string[] {
  const matches = selector.match(/\.([A-Za-z0-9_-]+)/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1));
}

function resolveSelectors(rule: Rule): string[] {
  const current = rule.selectors || [rule.selector];

  // En yakın üst rule'u bul (at-rules içindekileri de çöz)
  let parent: any = rule.parent;
  while (parent && parent.type !== "rule" && parent.parent) {
    parent = parent.parent;
  }
  if (!parent || parent.type !== "rule") return current;

  const parentSelectors = resolveSelectors(parent as Rule);
  const resolved: string[] = [];

  parentSelectors.forEach((pSel) => {
    current.forEach((sel) => {
      if (sel.includes("&")) {
        resolved.push(sel.replace(/&/g, pSel));
      } else {
        resolved.push(`${pSel} ${sel}`.trim());
      }
    });
  });

  return resolved;
}

/**
 * Kullanıcı CSS/SCSS çıktısından kullanılmayan class selector'larını temizler.
 * - Global/tag/id selector'larına dokunmaz.
 * - Virgülle ayrılmış selector'larda sadece kullanılanları bırakır.
 * - Boş kalan rule'ları ve @media/@supports gibi at-rule'ları siler.
 */
export function purgeUnusedCss(
  css: string,
  usedClasses: Set<string>
): string {
  const root = postcss.parse(css);

  root.walkRules((rule: Rule) => {
    const selectors = resolveSelectors(rule);
    const keptSelectors: string[] = [];

    selectors.forEach((sel) => {
      const classes = extractClasses(sel);
      if (classes.length === 0) {
        keptSelectors.push(sel); // global/tag/id selector
        return;
      }
      const keep = classes.some((cls) => usedClasses.has(cls));
      if (keep) keptSelectors.push(sel);
    });

    if (keptSelectors.length === 0) {
      rule.remove();
      return;
    }

    // Selector listesini daralt
    if (rule.selectors && keptSelectors.length !== rule.selectors.length) {
      rule.selectors = keptSelectors;
    }

    // Rule içinde hiç declaration kalmadıysa (yalnızca yorum/at-rule) sil
    const hasDecl = rule.nodes?.some((n) => n.type === "decl");
    if (!hasDecl) {
      rule.remove();
    }
  });

  // Boş kalan at-rule'ları temizle
  root.walkAtRules((atRule: AtRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) {
      atRule.remove();
    }
  });

  return root.toString();
}
