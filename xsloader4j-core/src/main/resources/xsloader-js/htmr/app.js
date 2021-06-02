
window.__htmr_init_bridge_=function(){
	xsloader.define("htmr-main",["#{react}","#{react-dom}"],function(React,ReactDOM){//须先等待react加载完成
		this.require(["default!#{app}"],function(App){
			if(xsloader.isFunction(App)){
				App=React.createElement(App, null);
			}

			ReactDOM.render(App,document.getElementById('react-app'));
		}).setTag("#{app}");
    });
};