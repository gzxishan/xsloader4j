{
	"properties":{
		"contextPath":"#{contextPath}",
		"staticUrlPrefix":"#{staticUrlPrefix}",
		"libReplace":{
               "libxs/":{
                    "replace":"${staticUrlPrefix}/libxs/"
               },
               "lib/":{
                       "replace":"${staticUrlPrefix}/lib/"
              },
               "libui/":{
                     "replace":"${staticUrlPrefix}/libui/"
             }
         }
	},
	"main":{
		getPath:function(dataMain){
    		return dataMain||"./es-main/{name}.js";
    	},
		"before":function(){
			console.log("before:" + name);
		},
		"after":function(){
			console.log("after:" + name);
		}
	},
	"chooseLoader":function(localConfig){
		var path=this.getPagePath();
        if(xsloader.startsWith(path,"/test1/")){
            return "test1";
        }else if(xsloader.startsWith(path,"/test2-no-vue/")){
            return "test2-no-vue";
        }
        else if(xsloader.startsWith(path,"/test-mand-mobile/")){
            return "test-mand-mobile";
        }
        else{
            return "test1";
        }
	},
	"loader":{
		"test1":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02",
                "*[libxs/":"v=20200129-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{
                    "vue":"static/vue/vue.min.js"
            },
            "deps":{
				"*":"vue"//当有vue组件或jsx语法时，一定要先加载vue模块
            }
        },
		"test2-no-vue":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02",
                "*[libxs/":"v=20200129-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{

            },
            "deps":{

            }
        },
        "test-mand-mobile":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02"
            },
            "paths":{
				"vue":"static/vue/vue.min.js"
				//,"mand-mobile":"static/mand-mobile-2.9.5/mand-mobile.var.js"
				,"mand-mobile":"static/mand-mobile-2.9.5/index.js"
            },
            "deps":{
				"*":"vue"
				//,"mand-mobile":["css!static/mand-mobile-2.9.5/mand-mobile.var.css"]
            }
        },
         "test-vux":{
             "baseUrl":"${contextPath}/",
             "modulePrefix":{
                   "vux/":{
                        "replace":"static/vux-2.9.4/"
                   }
             },
              "urlArgs":{
                 "*[${contextPath}/":"v=20200130-02"
             },
             "paths":{
                "vue":"static/vue/vue.min.js"
                //,"mand-mobile":"static/mand-mobile-2.9.5/mand-mobile.var.js"
                ,"mand-mobile":"static/mand-mobile-2.9.5/index.js"
             },
             "deps":{
                "*":"vue"
                //,"mand-mobile":["css!static/mand-mobile-2.9.5/mand-mobile.var.css"]
             }
         }
	},
	"getPagePath":function(){
		var path=location.pathname.substring(this.properties.contextPath.length);
		return path;
	},
	"sporter":"${contextPath}/",
	"fromPath":function(path){
		return location.protocol+"//"+location.host+this.sporter+path;
	},
     "beforeDealProperties":function(){

     }
}