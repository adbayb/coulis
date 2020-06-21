// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?
// @todo: always & to reference parent in selector ? Quid :hover, :focus
// @todo: server side extraction
// @todo: hydrate createProcessor cache client side from data-coulis tag ?
export { createCss, css, extractStyles, keyframes, raw } from "./coulis";
