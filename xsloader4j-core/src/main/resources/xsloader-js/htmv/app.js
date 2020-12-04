
window.__htmv_init_bridge_=function(){
	xsloader.define("htmv-main",["vue"],function(Vue){
		this.require(["default!#{app}"],function(App){
			new Vue({
                el: '##{app-id}',
                template:"<app class='#{app-class}'></app>",
                components:{
                    app:App
                }
            });
		})
		.setTag("#{app}");
    });
};