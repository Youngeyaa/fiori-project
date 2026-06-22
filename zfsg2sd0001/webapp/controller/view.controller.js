// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/model/json/JSONModel",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator",
//     "sap/m/SelectDialog",
//     "sap/m/StandardListItem"
// ], (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, SelectDialog, StandardListItem) => {
//     "use strict";

//     return Controller.extend("code.zfsg2sd0001.controller.view", {

//         onInit() {
//             var oViewModel = new JSONModel({
//                 approveEnabled: false,
//                 mappingVisible: true,
//                 mappingItems: [],
//                 pendingCount: 0,
//                 approvedCount: 0,
//                 selectedOrdno: "",
//                 isPendingTab: true
//             });
//             this.getView().setModel(oViewModel, "viewModel");

//             this.getView().addEventDelegate({
//                 onAfterRendering: () => {
//                     if (!this._initialized) {
//                         this.byId("headerTable").getBinding("items").filter([
//                             new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
//                         ]);
//                         this.byId("approvedTable").getBinding("items").filter([
//                             new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
//                         ]);
//                         this._initialized = true;
//                     }
//                 }
//             });
//         },

//         _loadCount: function () {
//             var oViewModel = this.getView().getModel("viewModel");
//             var oModel = this.getView().getModel();

//             oModel.read("/SalesOrderHeaderSet/$count", {
//                 filters: [new Filter("Ordsts", FilterOperator.EQ, "1")],
//                 success: (iCount) => { oViewModel.setProperty("/pendingCount", iCount); },
//                 error: () => { oViewModel.setProperty("/pendingCount", 0); }
//             });

//             oModel.read("/SalesOrderHeaderSet/$count", {
//                 filters: [new Filter("Ordsts", FilterOperator.EQ, "2")],
//                 success: (iCount) => { oViewModel.setProperty("/approvedCount", iCount); },
//                 error: () => { oViewModel.setProperty("/approvedCount", 0); }
//             });
//         },

//         onTabSelect: function (oEvent) {
//             var sKey = oEvent.getParameter("key");
//             var oViewModel = this.getView().getModel("viewModel");

//             oViewModel.setProperty("/isPendingTab", sKey === "pending");
//             oViewModel.setProperty("/approveEnabled", false);
//             oViewModel.setProperty("/mappingItems", []);
//             oViewModel.setProperty("/selectedOrdno", "");
//         },

//         _getCurrentTableId: function () {
//             return this.byId("tabBar").getSelectedKey() === "pending" ? "headerTable" : "approvedTable";
//         },

//         _getCurrentOrdsts: function () {
//             return this.byId("tabBar").getSelectedKey() === "pending" ? "1" : "2";
//         },

//         /**
//          * 공통 검색 필터 생성
//          */
//         _buildSearchFilters: function () {
//             var sCustid = this.byId("sfCustid").getValue().trim();
//             var sOrdno = this.byId("sfOrdno").getValue().trim();
//             var oOrddtFrom = this.byId("dpOrddtFrom").getDateValue();
//             var oOrddtTo   = this.byId("dpOrddtTo").getDateValue();

//             var aFilters = [];
//             if (sCustid) aFilters.push(new Filter("Custid", FilterOperator.EQ, sCustid));
//             if (sOrdno)  aFilters.push(new Filter("Ordno",  FilterOperator.EQ, sOrdno));

//             // 주문일 범위
//             if (oOrddtFrom && oOrddtTo) {
//                 aFilters.push(new Filter("Orddt", FilterOperator.BT, oOrddtFrom, oOrddtTo));
//             } else if (oOrddtFrom) {
//                 aFilters.push(new Filter("Orddt", FilterOperator.GE, oOrddtFrom));
//             } else if (oOrddtTo) {
//                 aFilters.push(new Filter("Orddt", FilterOperator.LE, oOrddtTo));
//             }

//             return aFilters;
//         },

//         /**
//          * 조회 버튼 - 두 탭 모두 조회
//          */
//         onSearch: function () {
//             var oModel = this.getView().getModel();
//             var oViewModel = this.getView().getModel("viewModel");
//             var aSearchFilters = this._buildSearchFilters();

//             // 승인 대기 테이블
//             var aPendingFilters = [new Filter("Ordsts", FilterOperator.EQ, "1")].concat(aSearchFilters);
//             this.byId("headerTable").getBinding("items").filter(aPendingFilters);
//             oModel.read("/SalesOrderHeaderSet/$count", {
//                 filters: aPendingFilters,
//                 success: (iCount) => { oViewModel.setProperty("/pendingCount", iCount); }
//             });

//             // 승인 완료 테이블
//             var aApprovedFilters = [new Filter("Ordsts", FilterOperator.EQ, "2")].concat(aSearchFilters);
//             this.byId("approvedTable").getBinding("items").filter(aApprovedFilters);
//             oModel.read("/SalesOrderHeaderSet/$count", {
//                 filters: aApprovedFilters,
//                 success: (iCount) => { oViewModel.setProperty("/approvedCount", iCount); }
//             });
//         },

//         /**
//          * 초기화 버튼 - 두 테이블 모두 빈 상태로
//          */
//         onReset: function () {
//             this.byId("sfCustid").setValue("");
//             this.byId("sfOrdno").setValue("");
//             this.byId("dpOrddtFrom").setValue("");
//             this.byId("dpOrddtTo").setValue("");

//             var oViewModel = this.getView().getModel("viewModel");

//             this.byId("headerTable").getBinding("items").filter([
//                 new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
//             ]);
//             this.byId("approvedTable").getBinding("items").filter([
//                 new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
//             ]);

//             oViewModel.setProperty("/mappingItems", []);
//             oViewModel.setProperty("/approveEnabled", false);
//             oViewModel.setProperty("/selectedOrdno", "");
//             oViewModel.setProperty("/pendingCount", 0);
//             oViewModel.setProperty("/approvedCount", 0);
//         },

//         onValueHelpCustid: function () {
//             var sOrdsts = this._getCurrentOrdsts();
//             var oModel = this.getView().getModel();

//             oModel.read("/SalesOrderHeaderSet", {
//                 filters: [new Filter("Ordsts", FilterOperator.EQ, sOrdsts)],
//                 urlParameters: { "$select": "Custid", "$orderby": "Custid asc" },
//                 success: (oData) => {
//                     var aData = oData.results.map((o) => ({ val: o.Custid }));
//                     var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);
//                     this._openSelectDialog("고객ID 선택", aUnique, "sfCustid");
//                 }
//             });
//         },

//         onValueHelpOrdno: function () {
//             var sOrdsts = this._getCurrentOrdsts();
//             var oModel = this.getView().getModel();

//             oModel.read("/SalesOrderHeaderSet", {
//                 filters: [new Filter("Ordsts", FilterOperator.EQ, sOrdsts)],
//                 urlParameters: { "$select": "Ordno", "$orderby": "Ordno desc" },
//                 success: (oData) => {
//                     var aData = oData.results.map((o) => ({ val: o.Ordno }));
//                     var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);
//                     this._openSelectDialog("오더번호 선택", aUnique, "sfOrdno");
//                 }
//             });
//         },

//         _openSelectDialog: function (sTitle, aData, sInputId) {
//             var oModel = new JSONModel({ items: aData });

//             var oDialog = new SelectDialog({
//                 title: sTitle,
//                 search: function (oEvent) {
//                     var sVal = oEvent.getParameter("value");
//                     oEvent.getSource().getBinding("items").filter([
//                         new Filter("val", FilterOperator.Contains, sVal)
//                     ]);
//                 },
//                 confirm: (oEvent) => {
//                     var oSelected = oEvent.getParameter("selectedItem");
//                     if (oSelected) {
//                         this.byId(sInputId).setValue(oSelected.getTitle());
//                         this.onSearch();
//                     }
//                     oDialog.destroy();
//                 },
//                 cancel: function () {
//                     oDialog.destroy();
//                 }
//             });

//             oDialog.setModel(oModel);
//             oDialog.bindAggregation("items", "/items", new StandardListItem({
//                 title: "{val}"
//             }));
//             oDialog.open();
//         },

//         onOrderSelect: function (oEvent) {
//             var oViewModel = this.getView().getModel("viewModel");
//             var oItem = oEvent.getParameter("listItem");

//             if (!oItem) {
//                 oViewModel.setProperty("/approveEnabled", false);
//                 oViewModel.setProperty("/mappingItems", []);
//                 return;
//             }

//             var oData = oItem.getBindingContext().getObject();
//             var sOrdno = oData.Ordno;
//             var sOrdsts = oData.Ordsts;

//             if (sOrdsts === '2') {
//                 oViewModel.setProperty("/approveEnabled", false);
//                 MessageToast.show("이미 승인된 오더입니다.");
//                 return;
//             }

//             oViewModel.setProperty("/selectedOrdno", sOrdno);
//             var oModel = this.getView().getModel();

//             oModel.read("/SalesOrderMappingSet", {
//                 filters: [new Filter("Refno", FilterOperator.EQ, sOrdno)],
//                 success: (oMappingData) => {
//                     var aMappingItems = oMappingData.results;

//                     oModel.read("/StockInfoSet", {
//                         filters: [new Filter("Refno", FilterOperator.EQ, sOrdno)],
//                         success: (oStockData) => {
//                             var aStockItems = oStockData.results;

//                             aMappingItems.forEach((oMappingItem) => {
//                                 var oStock = aStockItems.find(
//                                     (s) => s.Prodcd === oMappingItem.Prodcd && s.Whscd === oMappingItem.Whscd
//                                 );
//                                 oMappingItem.Avlqty = oMappingItem.Stksts === 'N'
//                                     ? (oStock ? oStock.Avlqty : 0)
//                                     : '-';
//                             });

//                             oViewModel.setProperty("/mappingItems", aMappingItems);

//                             var bHasShortage = aMappingItems.some((o) => o.Stksts === 'N');
//                             oViewModel.setProperty("/approveEnabled", !bHasShortage);
//                         },
//                         error: () => { MessageBox.error("실시간 재고 조회 오류"); }
//                     });
//                 },
//                 error: () => { MessageBox.error("제품 소요 현황 조회 오류"); }
//             });
//         },

//         onApprove: function () {
//             var oViewModel = this.getView().getModel("viewModel");
//             var sOrdno = oViewModel.getProperty("/selectedOrdno");
//             var oModel = this.getView().getModel();

//             if (!sOrdno) {
//                 MessageBox.warning("승인할 오더를 선택해주세요.");
//                 return;
//             }

//             MessageBox.confirm("오더 [" + sOrdno + "] 를 승인하시겠습니까?", {
//                 onClose: (oAction) => {
//                     if (oAction === MessageBox.Action.OK) {
//                         sap.ui.core.BusyIndicator.show(0);

//                         oModel.update("/SalesOrderHeaderSet('" + sOrdno + "')", {
//                             Ordno: sOrdno,
//                             Ordsts: "2"
//                         }, {
//                             success: () => {
//                                 sap.ui.core.BusyIndicator.hide();
//                                 MessageToast.show("오더 [" + sOrdno + "] 승인 완료");
//                                 oViewModel.setProperty("/approveEnabled", false);
//                                 oViewModel.setProperty("/selectedOrdno", "");
//                                 oViewModel.setProperty("/mappingItems", []);
//                                 this.onSearch();
//                             },
//                             error: (oError) => {
//                                 sap.ui.core.BusyIndicator.hide();
//                                 var sMsg = "승인 처리 오류";
//                                 try {
//                                     var oErrorBody = JSON.parse(oError.responseText);
//                                     sMsg = oErrorBody.error.message.value;
//                                 } catch (e) {}
//                                 MessageBox.error(sMsg);
//                             }
//                         });
//                     }
//                 }
//             });
//         }

//     });
// });




sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ui/export/Spreadsheet"
], (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, SelectDialog, StandardListItem, Spreadsheet) => {
    "use strict";

    return Controller.extend("code.zfsg2sd0001.controller.view", {

        onInit() {
            var oViewModel = new JSONModel({
                approveEnabled: false,
                mappingVisible: true,
                mappingItems: [],
                pendingCount: 0,
                approvedCount: 0,
                selectedOrdno: "",
                isPendingTab: true
            });
            this.getView().setModel(oViewModel, "viewModel");

            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    if (!this._initialized) {
                        this.byId("headerTable").getBinding("items").filter([
                            new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
                        ]);
                        this.byId("approvedTable").getBinding("items").filter([
                            new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
                        ]);
                        this._initialized = true;
                    }
                }
            });
        },

        _getCurrentTableId: function () {
            return this.byId("tabBar").getSelectedKey() === "pending" ? "headerTable" : "approvedTable";
        },

        _getCurrentOrdsts: function () {
            return this.byId("tabBar").getSelectedKey() === "pending" ? "1" : "2";
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/isPendingTab", sKey === "pending");
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/mappingItems", []);
            oViewModel.setProperty("/selectedOrdno", "");
        },

        /**
         * 공통 검색 필터 생성
         */
        _buildSearchFilters: function () {
            var sCustid = this.byId("sfCustid").getValue().trim();
            var sOrdno = this.byId("sfOrdno").getValue().trim();
            var oOrddtFrom = this.byId("dpOrddtFrom").getDateValue();
            var oOrddtTo   = this.byId("dpOrddtTo").getDateValue();

            var aFilters = [];
            if (sCustid) aFilters.push(new Filter("Custid", FilterOperator.EQ, sCustid));
            if (sOrdno)  aFilters.push(new Filter("Ordno",  FilterOperator.EQ, sOrdno));

            if (oOrddtFrom && oOrddtTo) {
                aFilters.push(new Filter("Orddt", FilterOperator.BT, oOrddtFrom, oOrddtTo));
            } else if (oOrddtFrom) {
                aFilters.push(new Filter("Orddt", FilterOperator.GE, oOrddtFrom));
            } else if (oOrddtTo) {
                aFilters.push(new Filter("Orddt", FilterOperator.LE, oOrddtTo));
            }

            return aFilters;
        },

        /**
         * 조회 버튼 - 두 탭 모두 조회
         */
        onSearch: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            var aSearchFilters = this._buildSearchFilters();

            sap.ui.core.BusyIndicator.show(0);

            var aPendingFilters = [new Filter("Ordsts", FilterOperator.EQ, "1")].concat(aSearchFilters);
            this.byId("headerTable").getBinding("items").filter(aPendingFilters);

            var aApprovedFilters = [new Filter("Ordsts", FilterOperator.EQ, "2")].concat(aSearchFilters);
            this.byId("approvedTable").getBinding("items").filter(aApprovedFilters);

            this.byId("headerTable").removeSelections(true);
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/mappingItems", []);
            oViewModel.setProperty("/selectedOrdno", "");

            var iDone = 0;
            var fnCheckDone = function () {
                iDone++;
                if (iDone >= 2) sap.ui.core.BusyIndicator.hide();
            };

            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: aPendingFilters,
                success: (iCount) => { oViewModel.setProperty("/pendingCount", iCount); fnCheckDone(); },
                error: () => { oViewModel.setProperty("/pendingCount", 0); fnCheckDone(); }
            });
            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: aApprovedFilters,
                success: (iCount) => { oViewModel.setProperty("/approvedCount", iCount); fnCheckDone(); },
                error: () => { oViewModel.setProperty("/approvedCount", 0); fnCheckDone(); }
            });
        },

        /**
         * 초기화 버튼
         */
        onReset: function () {
            this.byId("sfCustid").setValue("");
            this.byId("sfOrdno").setValue("");
            this.byId("dpOrddtFrom").setValue("");
            this.byId("dpOrddtTo").setValue("");

            var oViewModel = this.getView().getModel("viewModel");

            this.byId("headerTable").removeSelections(true);
            this.byId("headerTable").getBinding("items").filter([
                new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
            ]);
            this.byId("approvedTable").getBinding("items").filter([
                new Filter("Ordsts", FilterOperator.EQ, "__NONE__")
            ]);

            oViewModel.setProperty("/mappingItems", []);
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/selectedOrdno", "");
            oViewModel.setProperty("/pendingCount", 0);
            oViewModel.setProperty("/approvedCount", 0);
        },

        /**
         * 체크박스 선택 변경 → 승인 버튼 활성화만
         */
        onSelectionChange: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var aSelected = this.byId("headerTable").getSelectedItems();
            oViewModel.setProperty("/approveEnabled", aSelected.length > 0);
        },

        /**
         * 행 클릭 → 제품 소요 현황 표시
         */
        onItemPress: function (oEvent) {
            var oViewModel = this.getView().getModel("viewModel");
            var oItem = oEvent.getParameter("listItem");
            if (!oItem) return;

            var oData = oItem.getBindingContext().getObject();
            var sOrdno = oData.Ordno;
            oViewModel.setProperty("/selectedOrdno", sOrdno);

            var oModel = this.getView().getModel();
            oModel.read("/SalesOrderMappingSet", {
                filters: [new Filter("Refno", FilterOperator.EQ, sOrdno)],
                success: (oMappingData) => {
                    var aMappingItems = oMappingData.results;

                    oModel.read("/StockInfoSet", {
                        filters: [new Filter("Refno", FilterOperator.EQ, sOrdno)],
                        success: (oStockData) => {
                            var aStockItems = oStockData.results;

                            aMappingItems.forEach((oMappingItem) => {
                                var oStock = aStockItems.find(
                                    (s) => s.Prodcd === oMappingItem.Prodcd && s.Whscd === oMappingItem.Whscd
                                );
                                oMappingItem.Avlqty = oMappingItem.Stksts === 'N'
                                    ? (oStock ? oStock.Avlqty : 0)
                                    : '-';
                            });

                            oViewModel.setProperty("/mappingItems", aMappingItems);
                        },
                        error: () => { MessageBox.error("실시간 재고 조회 오류"); }
                    });
                },
                error: () => { MessageBox.error("제품 소요 현황 조회 오류"); }
            });
        },

        /**
         * 승인 버튼 - 선택된 오더 재고 부족 사전 체크
         */
        onApprove: function () {
            var oModel = this.getView().getModel();
            var oTable = this.byId("headerTable");
            var aSelected = oTable.getSelectedItems();

            if (aSelected.length === 0) {
                MessageBox.warning("승인할 오더를 선택해주세요.");
                return;
            }

            var aOrders = aSelected.map((oItem) => oItem.getBindingContext().getObject());

            sap.ui.core.BusyIndicator.show(0);

            var iChecked = 0;
            var aValidOrders = [];
            var aShortageOrders = [];

            aOrders.forEach((oOrder) => {
                oModel.read("/SalesOrderMappingSet", {
                    filters: [new Filter("Refno", FilterOperator.EQ, oOrder.Ordno)],
                    success: (oData) => {
                        var bShortage = oData.results.some((o) => o.Stksts === 'N');
                        if (bShortage) {
                            aShortageOrders.push(oOrder.Ordno);
                        } else {
                            aValidOrders.push(oOrder);
                        }
                        iChecked++;
                        if (iChecked === aOrders.length) {
                            this._confirmApprove(aValidOrders, aShortageOrders);
                        }
                    },
                    error: () => {
                        iChecked++;
                        if (iChecked === aOrders.length) {
                            this._confirmApprove(aValidOrders, aShortageOrders);
                        }
                    }
                });
            });
        },

        _confirmApprove: function (aValidOrders, aShortageOrders) {
            sap.ui.core.BusyIndicator.hide();

            if (aValidOrders.length === 0) {
                MessageBox.warning("선택한 오더가 모두 재고 부족 상태입니다.\n재고 부족: " + aShortageOrders.join(", "));
                return;
            }

            var sMsg = "승인 가능한 " + aValidOrders.length + "건을 승인하시겠습니까?";
            if (aShortageOrders.length > 0) {
                sMsg += "\n\n(재고 부족으로 제외: " + aShortageOrders.join(", ") + ")";
            }

            MessageBox.confirm(sMsg, {
                onClose: (oAction) => {
                    if (oAction !== MessageBox.Action.OK) return;
                    this._doApprove(aValidOrders);
                }
            });
        },

        _doApprove: function (aOrders) {
            var oModel = this.getView().getModel();
            sap.ui.core.BusyIndicator.show(0);

            var iTotal = aOrders.length;
            var iDone = 0;
            var iSuccess = 0;
            var aFailed = [];

            aOrders.forEach((oOrder) => {
                oModel.update("/SalesOrderHeaderSet('" + oOrder.Ordno + "')", {
                    Ordno: oOrder.Ordno,
                    Ordsts: "2"
                }, {
                    success: () => {
                        iSuccess++;
                        iDone++;
                        if (iDone === iTotal) this._afterApprove(iSuccess, aFailed);
                    },
                    error: () => {
                        aFailed.push(oOrder.Ordno);
                        iDone++;
                        if (iDone === iTotal) this._afterApprove(iSuccess, aFailed);
                    }
                });
            });
        },

        _afterApprove: function (iSuccess, aFailed) {
            sap.ui.core.BusyIndicator.hide();

            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/selectedOrdno", "");
            oViewModel.setProperty("/mappingItems", []);

            if (aFailed.length === 0) {
                MessageToast.show(iSuccess + "건 승인 완료");
            } else {
                MessageBox.warning(iSuccess + "건 승인 완료, " + aFailed.length + "건 실패\n실패: " + aFailed.join(", "));
            }

            this.onSearch();
        },

        onExportExcel: function () {
            var sTableId = this._getCurrentTableId();
            var oTable = this.byId(sTableId);
            var aItems = oTable.getItems();

            if (aItems.length === 0) {
                MessageToast.show("내보낼 데이터가 없습니다.");
                return;
            }

            var aData = aItems.map((oItem) => {
                var o = oItem.getBindingContext().getObject();
                return {
                    Ordno:    o.Ordno,
                    Custid:   o.Custid,
                    Orddt:    o.Orddt,
                    Ordseq:   o.Ordseq,
                    Totamt:   o.Totamt,
                    Currency: o.Currency,
                    Ordsts:   o.Ordsts === "1" ? "대기" : "승인"
                };
            });

            var aColumns = [
                { label: "오더번호", property: "Ordno" },
                { label: "고객ID",   property: "Custid" },
                { label: "주문일",   property: "Orddt", type: "date", format: "yyyy-mm-dd" },
                { label: "회차",     property: "Ordseq" },
                { label: "총금액",   property: "Totamt", type: "number", delimiter: true },
                { label: "통화",     property: "Currency" },
                { label: "상태",     property: "Ordsts" }
            ];

            var sTabName = this._getCurrentOrdsts() === "1" ? "승인대기" : "승인완료";

            var oSpreadsheet = new Spreadsheet({
                workbook: { columns: aColumns },
                dataSource: aData,
                fileName: "판매오더_" + sTabName + "_" + new Date().toISOString().slice(0, 10) + ".xlsx"
            });

            oSpreadsheet.build()
                .then(() => { MessageToast.show("엑셀 다운로드 완료"); })
                .finally(() => { oSpreadsheet.destroy(); });
        },

        onValueHelpCustid: function () {
            var sOrdsts = this._getCurrentOrdsts();
            var oModel = this.getView().getModel();

            oModel.read("/SalesOrderHeaderSet", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, sOrdsts)],
                urlParameters: { "$select": "Custid", "$orderby": "Custid asc" },
                success: (oData) => {
                    var aData = oData.results.map((o) => ({ val: o.Custid }));
                    var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);
                    this._openSelectDialog("고객ID 선택", aUnique, "sfCustid");
                }
            });
        },

        onValueHelpOrdno: function () {
            var sOrdsts = this._getCurrentOrdsts();
            var oModel = this.getView().getModel();

            oModel.read("/SalesOrderHeaderSet", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, sOrdsts)],
                urlParameters: { "$select": "Ordno", "$orderby": "Ordno desc" },
                success: (oData) => {
                    var aData = oData.results.map((o) => ({ val: o.Ordno }));
                    var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);
                    this._openSelectDialog("오더번호 선택", aUnique, "sfOrdno");
                }
            });
        },

        _openSelectDialog: function (sTitle, aData, sInputId) {
            var oModel = new JSONModel({ items: aData });

            var oDialog = new SelectDialog({
                title: sTitle,
                search: function (oEvent) {
                    var sVal = oEvent.getParameter("value");
                    oEvent.getSource().getBinding("items").filter([
                        new Filter("val", FilterOperator.Contains, sVal)
                    ]);
                },
                confirm: (oEvent) => {
                    var oSelected = oEvent.getParameter("selectedItem");
                    if (oSelected) {
                        this.byId(sInputId).setValue(oSelected.getTitle());
                        this.onSearch();
                    }
                    oDialog.destroy();
                },
                cancel: function () {
                    oDialog.destroy();
                }
            });

            oDialog.setModel(oModel);
            oDialog.bindAggregation("items", "/items", new StandardListItem({
                title: "{val}"
            }));
            oDialog.open();
        }

    });
});