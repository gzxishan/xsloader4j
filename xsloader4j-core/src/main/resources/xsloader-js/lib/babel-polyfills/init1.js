(function(root) {
	function buildString(args) {
		let strs = [];
		for (let i = 0; i < args.length; i++) {
			strs.push(args[i]);
		}
		return strs.join("");
	}

	root.console = {
		assert(condition, str) {
			if (!condition) {
				this.warn(str);
			}
		},
		debug() {
			$jsBridge$.logText(buildString(arguments), "debug");
		},
		log() {
			$jsBridge$.logText(buildString(arguments), "log");
		},
		info() {
			$jsBridge$.logText(buildString(arguments), "info");
		},
		warn() {
			$jsBridge$.logText(buildString(arguments), "warn");
		},
		error() {
			$jsBridge$.logText(buildString(arguments), "error");
		},
		trace() {
			$jsBridge$.logText(buildString(arguments), "warn");
		},
	};

})(typeof self !== 'undefined' ? self : this);
