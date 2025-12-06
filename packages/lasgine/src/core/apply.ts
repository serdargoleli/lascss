import fs from "fs";
import postcss, { AtRule, Declaration, Root, Rule } from "postcss";
import { generateCss } from "./generator";
import { IConfigProps } from "./config";

const AT_RULE = "apply";

export function extractApplyClasses(
  filepath: string,
  cssMap: Map<string, string>,
  config: IConfigProps
) {
  // gele filepat içeriğini al
  const content = fs.readFileSync(filepath, "utf-8");
  // içeriği parse ederek AST oluştur
  const root = postcss.parse(content);

  root.walkAtRules(AT_RULE, (atRule) => {
    const clasess = atRule.params.split(/\s+/).filter(Boolean); // @apply ile sonrasındaki classları al
    const parent = atRule.parent; // content içinde parent classları alır

    // parent type rule ise nested class içeriyordur (örn: .btn-primary)
    if (parent?.type === "rule") {
      //nestedi çöz &-primary ?> btn-primary  dönderiri classadı
      const resolvedSelector = resolveSelector(parent as Rule);

      // Duplicate property kontrolü için Map oluştuuryorz aynı prop iki kere elkenmesin
      const existingProps = new Map<string, Declaration>();

      let moveToRoot = false; // nested classları root'a taşıma flag'ı

      if (parent.selector.includes("&")) {
        parent.selector = resolvedSelector;
        moveToRoot = true;
      }

      for (const className of clasess) {
        const fullcss = generateCss(className, cssMap, config);
        if (!fullcss) {
          continue;
        }

        const parsed = postcss.parse(fullcss);

        const firstNode = parsed.first;

        // eğer @media, @layer gibi at rule varsa
        if (firstNode?.type === "atrule") {
          handleAtRule(firstNode as AtRule, resolvedSelector, root);
        }
        // normal rule ise
        else if (firstNode?.type === "rule") {
          const generatedRule = firstNode as Rule;

          // Selector'ı değiştir (pseudo-selector ve modifier'ları koru)
          // Escaped colon'ları handle etmek için son : karakterini bul
          const lastColonIndex = generatedRule.selector.lastIndexOf(":");

          // Eğer : varsa ve escaped değilse (öncesinde \ yok)
          if (
            lastColonIndex > 0 &&
            generatedRule.selector[lastColonIndex - 1] !== "\\"
          ) {
            const pseudoPart = generatedRule.selector.substring(lastColonIndex);
            generatedRule.selector = resolvedSelector + pseudoPart;
          } else {
            // Pseudo yok, sadece selector değiştir
            generatedRule.selector = resolvedSelector;
          }

          handleNormalRule(generatedRule, atRule, existingProps, root, config);
        }
      }
      atRule.remove();

      if (moveToRoot && parent?.parent?.type !== "root") {
        const clonedRule = parent.clone();
        parent.remove();
        root.append(clonedRule);
      }
    }
  });

  return root;
}

function resolveSelector(rule: Rule): string {
  const selector = rule.selector;

  if (!selector.includes("&")) {
    return selector;
  }

  const parent = rule.parent;

  // eğer parent yoksa veya parent rule değilse doğrudan &-primary{} giibi tanımlama yaparsa &-> parantı olmadığı için replace ediyorz
  if (!parent || parent.type !== "rule") {
    return selector.replace(/&/g, "");
  }

  const parentSelector = resolveSelector(parent as Rule);

  return selector.replace(/&/g, parentSelector);
}

/**
 * Normal rule'ları işler (modifier olmayan class'lar)
 * Declaration'ları @apply'ın yerine ekler
 */
function handleNormalRule(
  generatedRule: Rule,
  atRule: AtRule,
  existingProps: Map<string, Declaration>,
  root?: Root,
  config?: IConfigProps
) {
  // Config'den pseudo-selector kontrolü
  const hasPseudo =
    config && checkIfPseudoSelector(generatedRule.selector, config);

  if (hasPseudo && root) {
    // Aynı selector'lı rule var mı kontrol et
    let existingPseudoRule: Rule | undefined;

    root.walkRules((rule) => {
      if (rule.selector === generatedRule.selector) {
        existingPseudoRule = rule;
      }
    });

    if (existingPseudoRule) {
      // Var olan rule'a declaration'ları ekle
      generatedRule.each((node) => {
        if (node.type === "decl") {
          existingPseudoRule!.append(node.clone());
        }
      });
    } else {
      // Yeni rule oluştur
      root.append(generatedRule.clone());
    }
  } else {
    // Normal class, declaration'ları inline ekle
    generatedRule.each((node) => {
      if (node.type === "decl") {
        const decl = node as Declaration;

        // Duplicate kontrolü
        if (existingProps.has(decl.prop)) {
          existingProps.get(decl.prop)?.remove();
        }
        // Yeni declaration'ı ekle
        const clonedDecl = decl.clone();
        atRule.parent?.insertBefore(atRule, clonedDecl);
        existingProps.set(decl.prop, clonedDecl);
      }
    });
  }
}

function handleAtRule(atRule: AtRule, targetSelector: string, root: Root) {
  atRule.walkRules((innerRule) => {
    // Media query içindeki selector'ı da düzelt (pseudo-selector'ı koru)
    const lastColonIndex = innerRule.selector.lastIndexOf(":");

    if (lastColonIndex > 0 && innerRule.selector[lastColonIndex - 1] !== "\\") {
      const pseudoPart = innerRule.selector.substring(lastColonIndex);
      innerRule.selector = targetSelector + pseudoPart;
    } else {
      innerRule.selector = targetSelector;
    }
  });
  root.append(atRule.clone());
}

/**
 * Selector'da pseudo-selector var mı kontrol eder (config'den)
 * @param selector - CSS selector (.btn-primary:hover gibi)
 * @param config - Config objesi (variants içerir)
 * @returns Pseudo-selector varsa true
 */
function checkIfPseudoSelector(
  selector: string,
  config: IConfigProps
): boolean {
  // Selector'dan pseudo kısmını al (:hover, :focus, vs.)
  const pseudoMatch = selector.match(/:([a-z-]+)(?:\([^)]*\))?$/);
  if (!pseudoMatch) return false;

  const pseudoName = pseudoMatch[1]; // "hover" (: olmadan)

  // Config'deki variant'larda var mı kontrol et
  return pseudoName in config.variants;
}
