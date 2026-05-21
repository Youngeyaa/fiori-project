

// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast"
// ], (Controller, MessageBox, MessageToast) => {
//     "use strict";

//     return Controller.extend("code.zfmg2sd0001.controller.view", {
        
//         onInit() {
//             // 초기화 로직 (필요시)
//         },

//         /**
//          * [오더 승인] 버튼 클릭 이벤트
//          */
//         onApprove: function () {
//             var oTable = this.byId("headerTable");
//             var aSelectedItems = oTable.getSelectedItems();

//             if (aSelectedItems.length === 0) {
//                 MessageBox.warning("승인할 오더를 선택해주세요.");
//                 return;
//             }

//             var oModel = this.getView().getModel(); // manifest.json의 기본 모델
//             var iTotal = aSelectedItems.length;
//             var iSuccess = 0;
//             var iFail = 0;

//             MessageBox.confirm(iTotal + "건의 오더를 승인하시겠습니까?", {
//                 onClose: (oAction) => {
//                     if (oAction === MessageBox.Action.OK) {
//                         sap.ui.core.BusyIndicator.show(0);
                        
//                         aSelectedItems.forEach((oItem) => {
//                             var oContext = oItem.getBindingContext();
//                             var sPath = oContext.getPath();
//                             var oData = oContext.getObject();

//                             // 백엔드 UPDATE_ENTITY(PUT) 호출
//                             oModel.update(sPath, {
//                                 "Ordno": oData.Ordno,
//                                 "Ordseq": oData.Ordseq,
//                                 "Ordsts": "2" 
//                             }, {
//                                 success: () => {
//                                     iSuccess++;
//                                     this._onProcessFinished(iTotal, iSuccess, iFail);
//                                 },
//                                 error: () => {
//                                     iFail++;
//                                     this._onProcessFinished(iTotal, iSuccess, iFail);
//                                 }
//                             });
//                         });
//                     }
//                 }
//             });
//         },

//         /**
//          * 처리 완료 후 테이블 갱신
//          */
//         _onProcessFinished: function (iTotal, iSuccess, iFail) {
//             if (iSuccess + iFail === iTotal) {
//                 sap.ui.core.BusyIndicator.hide();
//                 this.byId("headerTable").removeSelections();
                
//                 if (iFail === 0) {
//                     MessageToast.show(iSuccess + "건 승인 완료");
//                     this.byId("headerTable").getBinding("items").refresh();
//                 } else {
//                     MessageBox.error("승인 중 오류 발생 (성공: " + iSuccess + ", 실패: " + iFail + ")");
//                 }
//             }
//         },

//         /**
//          * [새로고침] 버튼 클릭
//          */
//         onRefresh: function () {
//             this.byId("headerTable").getBinding("items").refresh();
//         }
//     });
// });



sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageBox, MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("code.zfmg2sd0001.controller.view", {

        onInit() {
            // ViewModel 초기화
            var oViewModel = new JSONModel({
                approveEnabled: false,
                mappingVisible: false,
                mappingItems: [],
                selectedOrdno: ""
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        /**
         * 오더 행 클릭 시 제품 소요 현황 조회
         */
        onOrderSelect: function (oEvent) {
            var oViewModel = this.getView().getModel("viewModel");
            var oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                oViewModel.setProperty("/mappingVisible", false);
                oViewModel.setProperty("/approveEnabled", false);
                return;
            }

            var oData = oItem.getBindingContext().getObject();
            var sOrdno = oData.Ordno;
            var sOrdsts = oData.Ordsts;

            // 이미 승인된 오더는 상세 안 보여줌
            if (sOrdsts === '2') {
                oViewModel.setProperty("/mappingVisible", false);
                oViewModel.setProperty("/approveEnabled", false);
                MessageToast.show("이미 승인된 오더입니다.");
                return;
            }

            oViewModel.setProperty("/selectedOrdno", sOrdno);

            var oModel = this.getView().getModel();

            // ① 매핑 테이블 조회
            oModel.read("/SalesOrderMappingSet", {
                filters: [
                    new sap.ui.model.Filter("Ordno", sap.ui.model.FilterOperator.EQ, sOrdno)
                ],
                success: (oMappingData) => {
                    var aMappingItems = oMappingData.results;

                    // ② STKSTS = 'N'인 제품 실시간 재고 조회
                    oModel.read("/StockInfoSet", {
                        filters: [
                            new sap.ui.model.Filter("Ordno", sap.ui.model.FilterOperator.EQ, sOrdno)
                        ],
                        success: (oStockData) => {
                            var aStockItems = oStockData.results;

                            // 매핑 아이템에 실시간 재고 병합
                            aMappingItems.forEach((oItem) => {
                                var oStock = aStockItems.find(
                                    (s) => s.Prodcd === oItem.Prodcd && s.Whscd === oItem.Whscd
                                );
                                // STKSTS = 'N'인 경우만 실시간 재고 표시
                                oItem.Avlqty = oItem.Stksts === 'N'
                                    ? (oStock ? oStock.Avlqty : 0)
                                    : '-';
                            });

                            oViewModel.setProperty("/mappingItems", aMappingItems);
                            oViewModel.setProperty("/mappingVisible", true);

                            // ③ STKSTS = 'N' 존재 여부로 승인 버튼 활성/비활성
                            var bHasShortage = aMappingItems.some((o) => o.Stksts === 'N');
                            oViewModel.setProperty("/approveEnabled", !bHasShortage);
                        },
                        error: () => {
                            MessageBox.error("실시간 재고 조회 오류");
                        }
                    });
                },
                error: () => {
                    MessageBox.error("제품 소요 현황 조회 오류");
                }
            });
        },

        /**
         * 오더 승인 버튼 클릭
         */
        onApprove: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var sOrdno = oViewModel.getProperty("/selectedOrdno");
            var oModel = this.getView().getModel();

            if (!sOrdno) {
                MessageBox.warning("승인할 오더를 선택해주세요.");
                return;
            }

            MessageBox.confirm("오더 [" + sOrdno + "] 를 승인하시겠습니까?", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        sap.ui.core.BusyIndicator.show(0);

                        // 승인 전 재고 재조회 후 UPDATE 호출
                        oModel.update("/SalesOrderHeaderSet('" + sOrdno + "')", {
                            Ordno: sOrdno,
                            Ordsts: "2"
                        }, {
                            success: () => {
                                sap.ui.core.BusyIndicator.hide();
                                MessageToast.show("오더 [" + sOrdno + "] 승인 완료");

                                // 초기화
                                oViewModel.setProperty("/mappingVisible", false);
                                oViewModel.setProperty("/approveEnabled", false);
                                oViewModel.setProperty("/selectedOrdno", "");
                                oViewModel.setProperty("/mappingItems", []);

                                this.byId("headerTable").getBinding("items").refresh();
                            },
                            error: (oError) => {
                                sap.ui.core.BusyIndicator.hide();
                                var sMsg = "승인 처리 오류";
                                try {
                                    var oErrorBody = JSON.parse(oError.responseText);
                                    sMsg = oErrorBody.error.message.value;
                                } catch (e) {}
                                MessageBox.error(sMsg);
                            }
                        });
                    }
                }
            });
        },

        /**
         * 새로고침
         */
        onRefresh: function () {
            this.byId("headerTable").getBinding("items").refresh();
        }
    });
});