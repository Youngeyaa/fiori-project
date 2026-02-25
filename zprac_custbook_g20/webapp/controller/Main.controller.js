sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("code.zpraccustbookg20.controller.Main", {
        onInit() {
        },

    
        onSelectionChange(oEvent){
            // 선택된 아이템의 바인딩 정보 (Context) 를 가져옴
            let oItem = oEvent.getParameter("listItem");
            let oContext = oItem.getBindingContext();
            let sPath = oContext.getPath();

            //SimpleForm 바인딩 (bindElement 사용)
            //폼이 선택한 고객의 정보를 보여줄 수 있도록 하는 것 
            let oForm = this.byId("idCustomerForm");
            oForm.bindElement(sPath);

            // 예약 내역 테이블 바인딩 (bindItem 사용)
            // 테이블이 고객 경로 뒤에 붙은 ToBooking 을 통해 데이터를 가져오게 시키는 것
            let oBookingTable = this.byId("idBookingTable");
            oBookingTable.bindItems({
                path: sPath + "/ToBooking",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{Carrid}"}),
                        new sap.m.Text({ text: "{Bookid}"})
                    ]
                })

            })

        },

        onPress(){

            // 검색창에 입력한 글자 가져오기
            let oInput = this.byId("inp1").getValue();

            let aFilters = [];
            // 검색어가 입력되었을 때만 필터 조건 만들기
            if (oInput) {
                let oFilter = new Filter("Name", FilterOperator.Contains, oInput);
                aFilters.push(oFilter);
            }

            // 데이터를 뿌려주고 있는 테이블 
            let oTable = this.byId("idCustomerTable");
            let oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

        }

    });
});