<template>
    <h1 :class="{...classNames}">{{info}}</h1>
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