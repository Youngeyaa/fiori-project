sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.zdemo04g20.controller.Main", {
        onInit() {
        },

        onValueHelpRequest(oEvent){

            //Search help
            this._Carrid = oEvent.getSource().getId(); // input field (inpCarrid)를 _Carrid 라는 임시 저장소에 저장.
            if(!this._oValueHelpDialog) {
                this._oValueHelpDialog = sap.ui.xmlfragment(
                    "code.zdemo04g20.view.vhCarrid",  // resource root : code.zdemo04g20 
                    this
                );

                this.getView().addDependent(this._oValueHelpDialog);
            }
            this._oValueHelpDialog.open();
        },

        onValueHelpClose: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            if(oSelectedItem){
                let oInput = this.getView().byId(this._Carrid);
                oInput.setValue(oSelectedItem.getTitle());
            }
        },

        onValueHelpSearch (oEvent){
            let selValue = oEvent.getParameters("value");
            // let oFilter = new sap.ui.model.Filter("Carrname", sap.ui.model.FilterOperator.Contains, selValue.value);
            let oFilter = new sap.ui.model.Filter("Carrname", sap.ui.model.FilterOperator.StartsWith, selValue.value);
            let aFilter = [ oFilter ];
            oEvent.getParameter("itemsBinding").filter(aFilter);
        }
    });
});