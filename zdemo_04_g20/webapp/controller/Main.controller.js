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
        },

        onPopup(){
            let that = this; // function scope 안으로 들어가면 이 컨트롤러를 가리키던 this가 자신이 누구인지 까먹음
                            // 따라서 this를 하나 복사해둠으로써 function 내부에서도 사용할 수 있게하는것임.
            let oView = this.getView();

             // 서버에 던질 oData 주소 
             // /CarrierSet(Carrid='LH')
            this._airlineSpath = "/CarrierSet(Carrid='" +
                                 this.getView().byId("inpCarrid").getValue() +
                                  "')"; 
           

            // 뷰 안에 "idDialog" 가 존재하지 않는다면? 
            if (!this.getView().byId("idDialog")) {

                // Popup.fragment.xml 파일을 읽어옴
                sap.ui.core.Fragment.load(

                    { 
                        id: oView.getId(), // 프래그먼트 안의 id들이 현재 뷰에 종속되도록 설정
                        name: "code.zdemo04g20.view.Popup",// resource root 밑 view 폴더 밑에 Popup
                        type : "XML",
                        controller: this // 팝업창의 버튼 이벤트(onPopupClose 등)을 이 컨트롤러가 처리하도록 연결
                    }

                ).then ( // 로드가 성공적으로 끝나면 실행
 
                    function (oPopup) {
                        oView.addDependent(oPopup); // 팝업창 oPopup을 현재 뷰의 자식으로 등록  
                                                    // 이걸 해야 메인화면이 가진 모델을 파업창도 같이 쓸 수 있음.
                        let idPopup = oView.byId("idDialog");
                        idPopup.bindElement({  // element binding 

                            path: that._airlineSpath,
                            events: {
                                dataReceived: function(oData){
                                    idPopup.open();
                                }
                            }
                        });

                    }

                );
            } else {
                let idPopup = this.getView().byId("idDialog");
                idPopup.bindElement({
                    path : that._airlineSpath,
                    events: {
                        dataReceived: function(oData){
                            idPopup.open();
                        }
                    }
                })

            }
                                
        },
        onPopupClose: function() {
            if(this.byId("idDialog")){
             this.byId("idDialog").close();
            };
          
            if(this.byId("idDialog2")){
                this.byId("idDialog2").close();
            }
        
        },

        onPopupRead(){
            let that = this;
            let oView = that.getView(); // 이거 체크
            let sCarrid = this.getView().byId("inpCarrid").getValue();
            
            if (!this.getView().byId("idDialog2")) {

                 sap.ui.core.Fragment.load(

                    {
                        id: oView.getId(),
                        name: "code.zdemo04g20.view.Popup2",// resource root 밑 view 폴더 밑에 Popup
                        type : "XML",
                        controller: that // 이거도 체크
                    }

                ).then (
                    function(oPopup){
                        that._getAirlineRead(sCarrid);
                        let idPopup2 = oView.byId("idDialog2");
                        oView.addDependent(oPopup);
                        idPopup2.open();
                    }
                );
                
            } else {
                this._getAirlineRead(sCarrid);
                let idPopup2 = this.getView().byId("idDialog2");
                idPopup2.open();
            }

        },
        _getAirlineRead(pCarrid){
            let oModel = this.getView().getModel();
            let sPath  = oModel.createKey("/CarrierSet", {

                Carrid: pCarrid
            });

            let oView = this.getView();
            oModel.read(sPath,{
                success: function(oData, oResponse) {
                    let jsonModel = new sap.ui.model.json.JSONModel({});
                    oView.setModel(jsonModel, "popup");
                    oView.getModel("popup").setProperty("/", oData);
                    oView.byId("idDialog2").bindElement("popup/");
                },

                error: function(oError){
                    let oMesg = JSON.parse(oError.responseText);
                    sap.m.MessageBox.show(oMesg.error.message.value);
                }
            });
        }
    });
});