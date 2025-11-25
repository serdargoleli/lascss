import { readMetaCSS } from './read';

export interface Config {
    screens: Record<string, string>;
    variants: Record<string, string>;
}

export function loadConfig(): Config {
    const cssContent = readMetaCSS()
    const screens: Record<string, string> = {};
    const variants: Record<string, string> = {};

    // Regex ile değişkenleri al: --las-(breakpoint|variant)-([a-z0-9-]+):\s*([^;]+);
    const regex = /--las-(breakpoint|variant)-([a-z0-9-]+):\s*([^;]+);/g;
    let match;

    while ((match = regex.exec(cssContent)) !== null) {
        const type = match[1]; // breakpoint veya variant
        const name = match[2]; // sm, md, hover vs.
        const value = match[3].trim(); // 768px, :hover vs.

        if (type === 'breakpoint') {
            screens[name] = value;
        } else if (type === 'variant') {
            variants[name] = value;
        }
    }
    return { screens, variants };

}

