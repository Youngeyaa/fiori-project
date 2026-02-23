sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.zdemo03g20.controller.Main", {
        onInit() {

            let oData = {
                isEdit: false
            };

            let oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel, "mode");
        },

        onSearch(){

            let aFilters = [];
            let cityFrom = this.byId("idFrominput").getValue();
            if (cityFrom){
                aFilters.push(new sap.ui.model.Filter("Cityfrom", sap.ui.model.FilterOperator.Contains, cityFrom))
                // new spa.ui.model.Filter("어느 항목에서 찾을지", "어떻게 찾을지", 입력한 값)
                // Cityfrom 과 같은 컬럼명이 정확히 기억나지 않을 경우 segw 를 참고할 것.
            };

            let cityTo = this.byId("idToinput").getValue();
            if(cityTo){
                aFilters.push(new sap.ui.model.Filter("Cityto", sap.ui.model.FilterOperator.Contains, cityTo))
            };

            let oTable = this.byId("idInfoTable");
            oTable.bindItems({
                path: "/ConnectSet",
                filters: aFilters,
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({text: "{Carrid}"}),
                        new sap.m.Text({text: "{Connid}"}),
                        new sap.m.Text({text: "{Cityfrom}"}),
                        new sap.m.Text({text: "{Airpfrom}"}),
                        new sap.m.Text({text: "{Cityto}"}),
                        new sap.m.Text({text: "{Airpto}"}),
                    ]
                })
            });
        },

        onSelectionChange (oEvent){
            let oSelectedItem = oEvent.getParameter("listItem");
            let oContext = oSelectedItem.getBindingContext();

            if(!oContext){
                return;
            };

            let sPath = oContext.getPath();
            let oPanel = this.byId("panInfo");
            oPanel.bindElement(sPath);

            let oModel = this.getView().getModel("mode");
            oModel.setProperty("/isEdit", true);
        },

        onReset(){
            let oPanel = this.byId("panInfo");
            oPanel.unbindElement();

            
            let oModel = this.getView().getModel("mode");
            oModel.setProperty("/isEdit", false);

        }

    });
});