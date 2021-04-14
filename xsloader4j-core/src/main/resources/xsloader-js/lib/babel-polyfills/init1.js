(function(root) {
	root.console = {
		assert(condition, str) {
			if (!condition) {
				$jsBridge$.warn(str);
			}
		}
	};

})(typeof self !== 'undefined' ? self : this);