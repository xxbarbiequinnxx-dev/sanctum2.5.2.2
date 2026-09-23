export function acceptsHtml() { return true; }
export function createHeadInjector() { return { inject() {} }; }
export function injectGrokPwaHead(html) { return html; }
export function isDocumentPath() { return true; }
export function isInstallQuery() { return false; }
export function renderInstallPageHtml() { return ""; }
export function renderWebManifest() { return "{}"; }
export function snapshotOgIdentity() { return {}; }
