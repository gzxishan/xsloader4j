
window.__htmv_init_bridge_=function(){
	var deps=["vue"];
	if(#{reactAutojs}){
		deps.push("#{react}","#{react-dom}");
	}

	xsloader.define("htmv-main",deps,function(Vue){//须先等待vue加载完成
		this.require(["default!#{app}"],function(App){
			var appid='#{app-id}';
			var appclass='#{app-class}';

			document.getElementById(appid).innerHTML = "";
			new Vue({
                el: '#'+appid,
                template:"<app id='"+appid+"' class='"+appclass+"'></app>",
                components:{
                    app:App
                }
            });
		}).setTag("#{app}");
    });
};