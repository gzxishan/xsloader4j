(function(global) { //https://github.com/Kingwl/core-js/
	"use strict";
	var undefined = (void 0);
	const UNSUPPORTED_Y = (() => {
		try {
			new RegExp("test", "y");
			return true;
		} catch (e) {
			return false;
		}
	})();

	if (!UNSUPPORTED_Y) {

		var NativeRegExp = RegExp;
		var nativeExec = NativeRegExp.prototype.exec;
		var RegExpPrototype = NativeRegExp.prototype;
		var re1 = /a/g;

		// "new" should create a new object, old webkit bug
		var CORRECT_NEW = new NativeRegExp(re1) !== re1;

		var regexpFlags = function() {
			var that = this;
			var result = '';
			if (that.global) result += 'g';
			if (that.ignoreCase) result += 'i';
			if (that.multiline) result += 'm';
			if (that.dotAll) result += 's';
			if (that.unicode) result += 'u';
			if (that.sticky) result += 'y';
			return result;
		}

		var patchedExec = function exec(str) {
			var re = this;
			var reCopy, match, i;
			var sticky = re.sticky;
			var flags = regexpFlags.call(re);
			var source = re.source;
			var charsAdded = 0;
			var strCopy = str;

			if (sticky) {
				flags = flags.replace('y', '');
				if (flags.indexOf('g') === -1) {
					flags += 'g';
				}

				strCopy = String(str).slice(re.lastIndex);
				// Support anchored sticky behavior.
				if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !==
						'\n')) {
					source = '(?: ' + source + ')';
					strCopy = ' ' + strCopy;
					charsAdded++;
				}
				// ^(? + rx + ) is needed, in combination with some str slicing, to
				// simulate the 'y' flag.
				reCopy = new NativeRegExp('^(?:' + source + ')', flags);
			}

			match = nativeExec.call(sticky ? reCopy : re, strCopy);

			if (sticky) {
				if (match) {
					match.input = match.input.slice(charsAdded);
					match[0] = match[0].slice(charsAdded);
					match.index = re.lastIndex;
					re.lastIndex += match[0].length;
				} else re.lastIndex = 0;
			}

			return match;
		};

		function inheritIfRequired($this, dummy, Wrapper) {
			var NewTarget, NewTargetPrototype;
			if (
				// it can work only with native `setPrototypeOf`
				Object.setPrototypeOf &&
				// we haven't completely correct pre-ES6 way for getting `new.target`, so use this
				typeof(NewTarget = dummy.constructor) == 'function' &&
				NewTarget !== Wrapper &&
				isObject(NewTargetPrototype = NewTarget.prototype) &&
				NewTargetPrototype !== Wrapper.prototype
			) Object.setPrototypeOf($this, NewTargetPrototype);
			return $this;
		};

		function RegExpWrapper(pattern, flags) {
			var thisIsRegExp = this instanceof RegExpWrapper;
			var patternIsRegExp = pattern instanceof NativeRegExp;
			var flagsAreUndefined = flags === undefined;

			if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
				return pattern;
			}

			if (CORRECT_NEW) {
				if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
			} else if (pattern instanceof RegExpWrapper) {
				if (flagsAreUndefined) flags = getFlags.call(pattern);
				pattern = pattern.source;
			}

			var sticky = !!flags && flags.indexOf('y') > -1;
			if (sticky) {
				flags = flags.replace(/y/g, '');
			}

			var result = inheritIfRequired(
				CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
				thisIsRegExp ? this : RegExpPrototype,
				RegExpWrapper
			);

			result.sticky = sticky;
			if (this) {
				this.sticky = sticky;
			}

			if (sticky) {
				result.exec = patchedExec;
				if (this) {
					this.exec = patchedExec;
				}
			}

			return result;
		};

		var proxy = function(key) {
			key in RegExpWrapper || Object.defineProperty(RegExpWrapper, key, {
				configurable: true,
				get: function() {
					return NativeRegExp[key];
				},
				set: function(it) {
					NativeRegExp[key] = it;
				}
			});
		};
		var keys = Object.getOwnPropertyNames(NativeRegExp);
		var index = 0;
		while (keys.length > index) proxy(keys[index++]);
		RegExpPrototype.constructor = RegExpWrapper;
		RegExpWrapper.prototype = RegExpPrototype;

		global.RegExp = RegExpWrapper;
	}




}(this));
