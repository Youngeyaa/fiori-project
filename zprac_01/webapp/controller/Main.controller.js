sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"

], (Controller,MessageToast,JSONModel) => {
    "use strict";

    return Controller.extend("code.zprac01.controller.Main", {
        onInit() {

        },



        onCreate(){
            // MessageToast.show("Button Clicked");

            let oView = this.getView();
            let sCarrid = oView.byId("InpAirlineCode").getValue();
            let sCarrname = oView.byId("InpAirlineName").getValue();
            let sCurrcode = oView.byId("InpCurrencyCode").getValue();

         if (!sCarrid || !sCarrname || !sCurrcode) {
              MessageToast.show("Fill out the fields.");
              return;
         }

         let oPayload = {
            Carrid : sCarrid,
            Carrname : sCarrname,
            Currcode : sCurrcode
         };

         let oModel = oView.getModel();

         oModel.create("/CarrierSet", oPayload, {
            success: function(){
            
              MessageToast.show("Data Created Successfully")
              oView.byId("InpAirlineCode").setValue("");
              oView.byId("InpAirlineName").setValue("");
              oView.byId("InpCurrencyCode").setValue("");
            },

            error: function(oError){
                MessageToast.show("error");
            }
         })
           


        },

        onChange(){

            let oView = this.getView();
            let sCarrid = oView.byId("InpAirlineCode").getValue();
            let sCarrname = oView.byId("InpAirlineName").getValue();
            let sCurrcode = oView.byId("InpCurrencyCode").getValue();

            if(!sCarrid) {
                MessageToast.show("Enter Airline Code to modify");
                return;

            }

            
            let oModel = oView.getModel();

            let sPath = oModel.createKey("/CarrierSet",{
                Carrid : sCarrid
            });

            let oPayload = {
                Carrid: sCarrid,
                Carrname: sCarrname,
                Currcode: sCurrcode
            };


            oModel.update(sPath, oPayload,{
                success: function(){
                    MessageToast.show("Updated successfully");
                },

                error: function(oError){
                    MessageToast.show("Error on Updating")
                }
            });
        },

        onDelete(){
            let oView = this.getView();
            let oModel = oView.getModel();

            let sCarrid = oView.byId("InpAirlineCode").getValue();

            if(!sCarrid) {
                MessageToast.show("Enter Airline code to delete");
                return;
            }

            let sPath = oModel.createKey("/CarrierSet",{
                Carrid : sCarrid
            });

            oModel.remove(sPath, {
                success: function() {
                    MessageToast.show("Deleted Successfuly");
                },
                error: function(oError){
                    MessageToast.show("error on deleting")
                }
            })
        }
    });
});