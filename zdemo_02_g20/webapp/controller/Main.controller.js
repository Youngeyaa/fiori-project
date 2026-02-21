sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.zdemo02g20.controller.Main", {
        onInit() {
        },

        // onSelectChange: function( oEvent ){

        //     let oSelectItem = oEvent.getParameter("listItem");
        //     let oContext = oSelectItem.getBindingContext();
        //     let sPath = oContext.getPath();
        //     // alert( sPath );

        //     let oTable = this.getView().byId("tabConnect");
        //     oTable.bindElement(sPath);
        // }

        onSelectChange: function( oEvent ){
            // 1. 클릭한 줄의 정보와 정확한 경로(Path) 가져오기
            let oSelectItem = oEvent.getParameter("listItem");
            let oContext = oSelectItem.getBindingContext();
            let sPath = oContext.getPath(); // 결과 예시: "/CarrierSet('AA')"
            
            // 2. 아래쪽 테이블(tabConnect) 가져오기
            let oTableConnect = this.getView().byId("tabConnect");

            // 3. 💡 핵심: 아래쪽 테이블에 클릭한 항공사의 경로를 묶어주기!
            oTableConnect.bindElement(sPath);
        }
    });
});