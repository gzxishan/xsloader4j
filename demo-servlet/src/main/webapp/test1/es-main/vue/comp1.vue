<template>
    <div>
        <h1 :class="{...classNames}">{{info}}</h1>
        <p>$thiz.getUrl():<span style="color:gray;">{{$thiz.getUrl()}}</span></p>
        <p>$thiz.getUrl("../index.js"):<span style="color:gray;">{{$thiz.getUrl("../index.js")}}</span></p>
    </div>
</template>

<script>
    export default{
        data(){
            return {
                   info:"HelloWorld",
                   classNames:{
                        teatA:true,
                        testB:true,
                   }
            }
        }
    }
</script>

<style lang="scss" scoped="true">
    &{
        margin:2em;
    }
</style>