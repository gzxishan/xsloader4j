
window.__htmv_init_bridge_=function(){
	xsloader.define("htmv-main",["vue"],function(Vue){//须先等待vue加载完成
		this.require(["default!#{app}"],function(App){
			var appid='#{app-id}';
			var appclass='#{app-class}';

			if(!xsloader.isFunction(App)){
                App=Vue.extend(App);
            }

            function setClass(vm){
                try{
                    vm.$el.classList.add(appclass);
                }catch(e){console.error(e)}
            }

            var vm = new App({
                mounted:function(){
                    try{
                        setClass(this);
                        this.$el.setAttribute("id",appid);
                    }catch(e){console.error(e)}
                },
                updated:function(){
                   setClass(this);
                }
            });
            document.getElementById(appid).innerHTML = "";
            vm.$mount('#'+appid);
		}).setTag("#{app}");
    });
};