(function(root) {

	/////////////////////////////
	///浏览器对象模拟:支持Vue.compile
	root.__initElement = function(element) {
		Object.defineProperty(element, "textContent", {
			get() {
				return this.$textContent();
			}
		});

		Object.defineProperty(element, "innerHTML", {
			get() {
				return this.$getInnerHTML();
			},
			set(value) {
				return this.$setInnerHTML(value);
			}
		});
	};
	root.location = {
		port: 0
	};
	root.window.document = root.document;
	root.window.location = root.location;

})(typeof self !== 'undefined' ? self : this);