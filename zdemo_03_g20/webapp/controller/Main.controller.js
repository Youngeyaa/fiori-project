sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.zdemo03g20.controller.Main", {
        onInit() {
        },

        onSearch(){

            let aFilters = [];
            let cityFrom = this.byId("idFrominput").getValue();
            if (cityFrom){
                aFilters.push(new sap.ui.model.Filter("Cityfrom", sap.ui.model.FilterOperator.Contains, cityFrom))
            };

            let cityTo = this.byId("idToinput").getValue();
            if(cityTo){
                aFilters.push(new sap.ui.model.Filter("CityTo", sap.ui.model.FilterOperator.Contains, cityTo))
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
        }
    });
});