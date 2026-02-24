// const { Fragment } = require("react/jsx-runtime");

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
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

            let airpFrom = this.byId("idAirpinput").getValue();
            if(airpFrom){

                aFilters.push(new sap.ui.model.Filter("Airpfrom", sap.ui.model.FilterOperator.Contains, airpFrom.toUpperCase()));
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

            
            let oModeModel = this.getView().getModel("mode");
            oModeModel.setProperty("/isEdit", false);

       
        },

    

        onInsert(){

            let oPayload = {
                    Carrid   : this.byId("inpInfoCarrid").getValue(),
                    Connid   : this.byId("inpInfoConnid").getValue(),
                    Cityfrom : this.byId("inpInfoCityfr").getValue(),
                    Airpfrom : this.byId("inpInfoAirpfr").getValue(),
                    Cityto   : this.byId("inpInfoCityto").getValue(),
                    Airpto   : this.byId("inpInfoAirpto").getValue()
                };

        //  서버와 통신할 기본 OData 모델을 가져오기
        let oModel = this.getView().getModel();

        //  서버의 엔티티셋(/ConnectSet)으로 데이터 생성(Create) 요청을 보내기.
        oModel.create("/ConnectSet", oPayload, {
            success: function() {
                // 서버 저장 성공 시 알림을 띄우고 테이블을 새로고침.
                sap.m.MessageToast.show("데이터가 성공적으로 저장되었습니다! 🎉");
                oModel.refresh(); 
            },
            error: function(oError) {
                // 서버 저장 실패 시 에러 메시지를 띄움.
                sap.m.MessageToast.show("저장 중 오류가 발생했습니다. 😢");
            }

            });

        },

        onUpdate(){

            // 서버와 통신할 기본 oData 모델 가져오기
            let oModel = this.getView().getModel();

            // 현재 패널에 연결된 데이터의 경로path 가져오기
            // ex : /connectset(carrid='AA', connnid='0014')

            let oContext = this.byId("panInfo").getBindingContext();

            if(!oContext){

                sap.m.MessageToast.show("Choose Data to update");
                return;
            }

            let sPath = oContext.getPath();

            // 화면의 입력칸에서 수정된 값 직접 수집
            let oPayload = {
                Carrid : this.byId("inpInfoCarrid").getValue(),
                Connid   : this.byId("inpInfoConnid").getValue(),
                Cityfrom : this.byId("inpInfoCityfr").getValue(),
                Airpfrom : this.byId("inpInfoAirpfr").getValue(),
                Cityto   : this.byId("inpInfoCityto").getValue(),
                Airpto   : this.byId("inpInfoAirpto").getValue()
            };

            oModel.update(sPath, oPayload, {
                success : function() {
                    sap.m.MessageToast.show("Updated successfully");
                    oModel.refresh();
                },
                error: function(){
                    sap.m.MessageToast.show("error occured");
                }
            });

        },

        onDelete(){

            //서버와 통신할 기본 odata 모델
            let oModel = this.getView().getModel();

            // 현재 패널에 연결된 데이터의 경로  가져오기 
            let oContext = this.byId("panInfo").getBindingContext();

            if(!oContext){
                sap.m.MessageToast.show("select data to delete");
                return;
            }

            let sPath = oContext.getPath();

            if(!confirm("Are you gonna delete this data for sure?")){
                return;
            }

            oModel.remove(sPath,{
                success: ()=>{
                    sap.m.MessageToast.show("Deleted Successfully");

                    let oPanel = this.byId("panInfo");
                    oPanel.unbindElement();
                    oModel.refresh();

                    let oModeModel = this.getView().getModel("mode");
                    oModeModel.setProperty("/isEdit", false);
                },

                error: function (){
                    sap.m.MessageToast.show("Error Occured whiile you delete")
                }
            });
        },

        onValueHelpRequest (oEvent){

            // this._Air = oEvent.getSource().getId();
            // if(!this._oValueHelpDialog){
            //     this._oValueHelpDialog = sap.ui.xmlfragment(
            //         "code.zdemo03g20.view.AirportDialog",
            //          this
            //     );

            //     this.getView().addDependent(this._oValueHelpDialog);
            // }
            // this._oValueHelpDialog.open();
          
            let oView = this.getView();

            if(!this._pDialog){
                this._pDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "code.zdemo03g20.view.AirportDialog",
                    controller: this

                }).then(function (oDialog) {
                    oView.addDependent(oDialog)
                    return oDialog;
                });
     
            }

            this._pDialog.then(function(oDialog){
                oDialog.open();
            })
        },

        onValueHelpClose(oEvent){
            let oSelectedItem = oEvent.getParameter("selectedItem");

            if(oSelectedItem){
                let sAirportCode = oSelectedItem.getTitle();
                console.log(sAirportCode);
                this.byId("idAirpinput").setValue(sAirportCode);
            }
        },

        onValueHelpSearch(oEvent){

            let selValue = oEvent.getParameters("value");
            let oFilter= new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, selValue.value);
            let aFilter = [ oFilter ]
            oEvent.getParameter("itemsBinding").filter(aFilter);
        }

    });
});