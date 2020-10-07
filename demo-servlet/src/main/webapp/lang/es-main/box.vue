<template>
	<div>
		<table>
			<tr>
				<td width="300px" style="background-color: gainsboro;padding: 5px;border-radius: 5px;">
					{{label}}
				</td>
				<template v-if="isSupport">
					<td width="60px" style="background-color: orange;padding: 5px;border-radius: 5px;color: white;">
						支持
					</td>
				</template>
				<template v-else>
					<td width="60px" style="background-color: gainsboro;padding: 5px;border-radius: 5px;color: red;">
						{{isSupport===undefined?"加载中":"不支持"}}
					</td>
				</template>
				<td style="font-size: 0.8em;padding: 5px;background-color: ghostwhite;border-radius: 5px;">
					{{description}}
				</td>
			</tr>
			<tr v-if="!!codeText">
				<td colspan="3">
					<div style="text-align: right;font-size: 0.8em;color: gray;padding: 5px;padding-top: 0;font-style: italic;text-decoration: underline;">
						<label @click="open=!open" style="cursor: pointer;">{{open?"隐藏例子":"显示例子"}}</label>
					</div>
					<div v-show="open">
						<div style="text-align: left;overflow: auto;">
							<label style="color: gray;font-size: 0.8em;">源码</label>
							<pre style="text-align: left;padding: 5px;border: 1px solid gainsboro;background-color: antiquewhite;">{{codeText}}</pre>
							<template v-if="!!outputText">
								<label style="color: gray;font-size: 0.8em;">转换后</label>
								<pre style="text-align: left;padding: 5px;border: 1px solid gainsboro;background-color: antiquewhite;">{{outputText}}</pre>
							</template>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
	import "text";
	export default {
		props: {
			label: String,
			description: String,
			ok: {
				type: Boolean,
				default: undefined,
			},
			code: String
		},
		data() {
			return {
				codeText: null,
				open: false,
				isSupport: undefined,
				outputText: undefined,
			}
		},
		async created() {
			let codeText = this.code;
			if (!codeText) {
				codeText = await import(`text!./code/${this.label}.js?__source=true`);
				this.outputText = await import(`text!./code/${this.label}.js`);
			}
			this.codeText = codeText;
			let isSupport = this.ok;
			if (isSupport === undefined) {
				let obj = await require([`./code/${this.label}.js`]);
				isSupport = obj['default'];
			}
			this.isSupport = true;
		}
	}
</script>

<style lang="scss" scoped="scoped">
	& {
		max-width: 100%;
		overflow: auto;
		table {
			border: 0;
			margin: 0;
			padding: 0;
			width: 100%;
		}
	}
</style>
