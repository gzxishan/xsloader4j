
window.__htmv_init_bridge_=function(){
	xsloader.define("htmv-main",["vue","default!#{app}"],function(Vue,App){
    	new Vue({
        	el: '##{app-id}',
        	template:"<app class='#{app-class}'></app>",
        	components:{
        	    app:App
        	}
        });
    });
};