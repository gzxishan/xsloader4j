<template>
  <div id="app">
    <div class="section checkbox">
      <md-check-box name="day" v-model="type" label="Daily" disabled/>
      <md-check-box name="month" v-model="type" label="Monthly"/>
      <md-check-box name="season" v-model="type" label="Quarterly"/>
    </div>
    <md-field class="section">
      <md-field-item solid title="Amount">
        <md-stepper slot="right" read-only/>
      </md-field-item>
    </md-field>
    <md-field class="section" title="Policy holder">
      <md-input-item title="Name" placeholder="Please fill in the name of the policy holder"></md-input-item>
      <md-input-item title="ID" placeholder="Please fill in the ID number of the policy holder"></md-input-item>
    </md-field>
    <md-field class="section" title="Insured">
      <md-input-item title="Name" placeholder="Please fill in the name of the insured"></md-input-item>
      <md-field-item title="Relation" :content="relation" arrow @click="isPickerShow = true" solid></md-field-item>
      <md-picker v-model="isPickerShow" :data="pickerData" large-radius @confirm="onPickerConfirm"></md-picker>
    </md-field>
    <md-agree class="agree" v-model="isAgree">
      <p
        class="agree-text"
      >I promise that the insured will fully understand the insurance product and guarantee the authenticity of the insurance information, understand and agree</p>
    </md-agree>
    <md-action-bar class="action-bar" :actions="actionBarData">
      <p class="price">&yen;128.00</p>
      <md-tag
        size="small"
        shape="circle"
        sharp="bottom-left"
        type="fill"
        fill-color="linear-gradient(90deg, #FC7353 0%, #FC9153 100%)"
        font-color="#fff"
      >discount</md-tag>
    </md-action-bar>
  </div>
</template>

<script>
import { Dialog } from "mand-mobile";
export default {
  name: "app",

  data() {
    return {
      type: "month",
      relation: "Self",
      isAgree: false,
      isPickerShow: false,
      actionBarData: [
        {
          text: "Insured",
          onClick() {
            Dialog.succeed({
              title: "Success",
              content: "Congratulations",
              confirmText: "Yes",
              cancelText: "Cancel"
            });
          }
        }
      ],
      pickerData: [
        [
          { text: "Self" },
          { text: "Parents" },
          { text: "Spouse" },
          { text: "Children" }
        ]
      ]
    };
  },

  methods: {
    onPickerConfirm(values) {
      this.relation = values[0].text;
    }
  }
};
</script>

<style>
body {
  padding-bottom: 140px;
  background: #f0f0f0;
}
.section {
  margin-bottom: 20px;
  background: #FFF;
}
.checkbox {
  padding: 20px 32px;
}
.checkbox .md-check-box {
  margin-right: 20px;
  box-shadow: 0 0 10px #E2E4EA;
  border: none;
}
.agree {
  padding: 0 16px;
}
.agree .agree-text {
  font-size: 16px;
  color: #666;
}
.action-bar .price {
  font-weight: 500;
  font-size: 32px;
  color: #FF823A;
}
.action-bar .price small {
  margin-left: 5px;
  font-size: 16px;
  color: #858B9C;
}
.action-bar .md-tag {
  margin-left: 5px;
}
</style>
