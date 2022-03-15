// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?
// @todo: hydrate createProcessor cache client side from data-coulis-keys tag ?
// @todo: rename `css` api to `styles` (universal platform meaning) -> plural since it can return multiple classnames and consistent with keyframes api
// @todo: rename `raw` api to `globals`? Keep keyframes
export { createCss, css, extractStyles, keyframes, raw } from "./api";
