//#region node_modules/.nitro/vite/services/ssr/assets/money-CbG-wRoi.js
function money(cents, currency) {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency
	}).format(cents / 100);
}
//#endregion
export { money as t };
