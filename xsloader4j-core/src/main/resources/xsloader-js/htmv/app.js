
window.__htmv_init_bridge_=function(){
	xsloader.define("htmv-main",["vue"],function(Vue){//须先等待vue加载完成
		this.require(["default!#{app}"],function(App){
			new Vue({
                el: '##{app-id}',
                template:"<app class='#{app-class}'></app>",
                components:{
                    app:App
                }
            });
		}).setTag("#{app}");
    });
};