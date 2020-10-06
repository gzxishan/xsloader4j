import "css!static/test.scss";//不是以“.”开头的路径相对于baseUrl
import txt from "text!./test.txt";

const appDom=document.getElementById("app");
appDom.innerText=txt;