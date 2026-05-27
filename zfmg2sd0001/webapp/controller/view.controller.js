sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("code.zfmg2sd0001.controller.view", {

        onInit() {
            var oViewModel = new JSONModel({
                approveEnabled: false,
                mappingVisible: true,
                mappingItems: [],
                pendingCount: 0,
                approvedCount: 0,
                selectedOrdno: ""
            });
            this.getView().setModel(oViewModel, "viewModel");

            // 렌더링 후 건수 조회
            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    this._loadCount();
                }
            });
        },

        /**
         * 대기/완료 건수 조회
         */
        _loadCount: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var oModel = this.getView().getModel();

            // 대기 건수
            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, "1")],
                success: (iCount) => {
                    oViewModel.setProperty("/pendingCount", iCount);
                },
                error: () => {
                    oViewModel.setProperty("/pendingCount", 0);
                }
            });

            // 완료 건수
            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, "2")],
                success: (iCount) => {
                    oViewModel.setProperty("/approvedCount", iCount);
                },
                error: () => {
                    oViewModel.setProperty("/approvedCount", 0);
                }
            });
        },

        /**
         * 오더 행 클릭 시 제품 소요 현황 조회
         */
        onOrderSelect: function (oEvent) {
            var oViewModel = this.getView().getModel("viewModel");
            var oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                oViewModel.setProperty("/approveEnabled", false);
                oViewModel.setProperty("/mappingItems", []);
                return;
            }

            var oData = oItem.getBindingContext().getObject();
            var sOrdno = oData.Ordno;
            var sOrdsts = oData.Ordsts;

            if (sOrdsts === '2') {
                oViewModel.setProperty("/approveEnabled", false);
                MessageToast.show("이미 승인된 오더입니다.");
                return;
            }

            oViewModel.setProperty("/selectedOrdno", sOrdno);

            var oModel = this.getView().getModel();

            // ① 매핑 테이블 조회
            oModel.read("/SalesOrderMappingSet", {
                filters: [
                    // new Filter("Ordno", FilterOperator.EQ, sOrdno)
                    new Filter("Refno", FilterOperator.EQ, sOrdno)
                ],
                success: (oMappingData) => {
                    var aMappingItems = oMappingData.results;

                    // ② STKSTS = 'N'인 제품 실시간 재고 조회
                    oModel.read("/StockInfoSet", {
                        filters: [
                            // new Filter("Ordno", FilterOperator.EQ, sOrdno)
                            new Filter("Refno", FilterOperator.EQ, sOrdno)
                        ],
                        success: (oStockData) => {
                            var aStockItems = oStockData.results;

                            // 매핑 아이템에 실시간 재고 병합
                            aMappingItems.forEach((oMappingItem) => {
                                var oStock = aStockItems.find(
                                    (s) => s.Prodcd === oMappingItem.Prodcd && s.Whscd === oMappingItem.Whscd
                                );
                                // STKSTS = 'N'인 경우만 실시간 재고 표시
                                oMappingItem.Avlqty = oMappingItem.Stksts === 'N'
                                    ? (oStock ? oStock.Avlqty : 0)
                                    : '-';
                            });

                            oViewModel.setProperty("/mappingItems", aMappingItems);

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

                        oModel.update("/SalesOrderHeaderSet('" + sOrdno + "')", {
                            Ordno: sOrdno,
                            Ordsts: "2"
                        }, {
                            success: () => {
                                sap.ui.core.BusyIndicator.hide();
                                MessageToast.show("오더 [" + sOrdno + "] 승인 완료");

                                oViewModel.setProperty("/approveEnabled", false);
                                oViewModel.setProperty("/selectedOrdno", "");
                                oViewModel.setProperty("/mappingItems", []);

                                this.byId("headerTable").getBinding("items").refresh();
                                this.byId("approvedTable").getBinding("items").refresh();

                                // 승인 후 건수 갱신
                                this._loadCount();
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
            this.byId("approvedTable").getBinding("items").refresh();
            this._loadCount();
        }
    });
});