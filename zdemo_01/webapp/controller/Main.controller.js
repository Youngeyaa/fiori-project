sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat"
], (Controller, DateFormat) => {
    "use strict";

    return Controller.extend("code.zdemo01.controller.Main", {
        onInit() {

        },
            onSearch() {

                let condCarrid = this.getView().byId("InpCarrid").getValue(); // 사용자가 입력한 값

                let oModel = this.getView().getModel();
                let sPath = oModel.createKey("/InfoSet", {
                    Carrid: condCarrid  // Carrid에 condCarrid 값을 담겠다. 
                    // ex) Carrid : 'AA'  => createKey 함수에 의해 url 문자열을 자동으로 조합
                    // sPath = "/InfoSet('AA')"
                    //  Carrid (받는 항목): "백엔드(OData)에 정의된 **항공사 코드(Carrid)**라는 칸에다가..."
                    // condCarrid (보낼 내용): "...사용자가 방금 화면에 입력한 값(condCarrid)을 집어넣어라!"
                });

                // alert( sPath );

                let oView = this.getView();
                oModel.read(sPath, {
                    success: function( oData ){
                        let jsonModel = new sap.ui.model.json.JSONModel({});
                        oView.setModel(jsonModel, "info"); //Main View에 info 라는 이름의 Jsonmodel을 할당.
                        oView.getModel("info").setProperty("/demo", oData);
                        oView.byId("PanelInfo").bindElement("info>/demo");
                    },
                
                    error: function (oError){

                        let oMesg = JSON.parse(oError.responseText);
                        sap.m.MessageToast.show( oMesg.error.message.value );
                        let oPanelInfo = oView.byId("PanelInfo").unbindElement();
                        oPanelInfo.unbindElement();

                    }

                });

        },

        onInsert() {
            let oView = this.getView();

            //  화면(View)의 각 입력칸에서 사용자가 적은 값 가져오기
            let sCarrid = oView.byId("InpInfoCarrid").getValue();
            let sPrice  = oView.byId("InpInfoPrice").getValue();
            let sWaers  = oView.byId("InpInfoWaers").getText(); // Text 태그는 getText()!

            // Currency를 바인딩 해놔서 입력칸에서 자동적으로 콤마가 찍힘
            // oView.byId("InpInfoPrice").getValue() 는 콤마가 그대로 포함된 글자를 긁어오는데 이는 백엔드단 ABAP
            // 숫자 필드 (Edm.decimal)는 숫자와 소수점만 받을 수 있다. 
            // 삽입된 콤마를 공백으로 변환하여 에러 처리를 해주면 된다.
            let sCleanPrice = sPrice.replace(/,/g, '');
            // 날짜는 DatePicker에서 '자바스크립트 날짜 객체'로 가져옴
            let oBegda  = oView.byId("DPBegda").getDateValue(); 
            let oEndda  = oView.byId("DPEndda").getDateValue();

            // 백엔드로 보낼 데이터 구성
            let oPayload = {
                Carrid : sCarrid,
                Begda  : this._DateTime(oBegda),  // 날짜 변환 함수 활용하여 타임스탬프 형식으로 변경
                Endda  : this._DateTime(oEndda),
                Price  : sCleanPrice,
                Waers  : sWaers
            };

            // OData 통신망 가져오기
            let oModel = oView.getModel();

            // 백엔드에 Create(POST)
            oModel.create("/InfoSet", oPayload, {
                success: function() {
                    sap.m.MessageToast.show("데이터가 성공적으로 생성되었습니다! 🎉");
                },
                error: function(oError) {
                    // 에러 메시지가 있으면 파싱해서 보여주고, 없으면 기본 메시지 출력
                    try {
                        let oMesg = JSON.parse(oError.responseText);
                        sap.m.MessageToast.show("생성 실패: " + oMesg.error.message.value);
                    } catch (e) {
                        sap.m.MessageToast.show("생성 중 에러가 발생했습니다.");
                    }
                }
            });
        },

        _DateTime(oDate) {
            // 사용자가 날짜를 안 적었으면 에러가 나지 않게 null을 반환.
            if (!oDate) 
                return null; 

            // DateFormat 도구를 이용해 백엔드에 설정된 타임스탬프형식으로 수정.
            let oDateTimeFormat = DateFormat.getDateTimeInstance({
                pattern : "yyyy-MM-dd'T'HH:mm:ss",
                UTC: false 
            });

            return oDateTimeFormat.format(oDate);
        },

   onUpdate(){
            let oModelUpdate = this.getView().getModel('info');
            let oDataUpdate = oModelUpdate.getData(); 
            let oModel = this.getView().getModel();

            let sPath = oModel.createKey("/InfoSet", {
                Carrid : oDataUpdate.demo.Carrid 
            });

            let oEntity = {
                Carrid : oDataUpdate.demo.Carrid, // 백엔드 수신을 위해 Key값도 넣어주는 것이 안전합니다.
                Begda: this._DateTime(oDataUpdate.demo.Begda),
                Endda: this._DateTime(oDataUpdate.demo.Endda),
                Price : new String(oDataUpdate.demo.Price).replace(/,/g, ''),
                Waers : oDataUpdate.demo.Waers
            };

            oModel.update(
                sPath,
                oEntity,
                {
                    success: function( oData, oResponse){
                        alert("success");
                    },

                    error : function( oError ){
                        alert("Error");
                    }
                }
            );
        },

        onDelete (){
            let oModelDel = this.getView().getModel('info');
            let oDataDel = oModelDel.getData(); 
            let oModel = this.getView().getModel();

            let sPath = oModel.createKey("/InfoSet", {
                Carrid : oDataDel.demo.Carrid 
            });
           
            oModel.remove(sPath,{
                success: function(oData){
                    alert("success");
                },

                error: function( oError ){
                    alert("error");
                }

            })
        }

    });
});