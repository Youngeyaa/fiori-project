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

//     return Controller.extend("code.zfmg2sd0001.controller.view", {

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
//                     this.byId("headerTable").getBinding("items").filter([
//                         new Filter("Ordsts", FilterOperator.EQ, "1")
//                     ]);
//                     this.byId("approvedTable").getBinding("items").filter([
//                         new Filter("Ordsts", FilterOperator.EQ, "2")
//                     ]);
//                     this._loadCount();
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
//             var bIsPending = sKey === "pending";

//             oViewModel.setProperty("/isPendingTab", bIsPending);
//             oViewModel.setProperty("/approveEnabled", false);
//             oViewModel.setProperty("/mappingItems", []);
//             oViewModel.setProperty("/selectedOrdno", "");

//             // 검색필드 초기화
//             this.byId("sfCustid").setValue("");
//             this.byId("sfOrdno").setValue("");

//             // 탭 전환 시 필터 초기화
//             this._applyFilter();
//         },

//         _getCurrentTableId: function () {
//             var sKey = this.byId("tabBar").getSelectedKey();
//             return sKey === "pending" ? "headerTable" : "approvedTable";
//         },

//         _getCurrentOrdsts: function () {
//             var sKey = this.byId("tabBar").getSelectedKey();
//             return sKey === "pending" ? "1" : "2";
//         },

//         _getCurrentCountKey: function () {
//             var sKey = this.byId("tabBar").getSelectedKey();
//             return sKey === "pending" ? "/pendingCount" : "/approvedCount";
//         },

//         _applyFilter: function () {
//             var sTableId = this._getCurrentTableId();
//             var sOrdsts = this._getCurrentOrdsts();
//             var sCountKey = this._getCurrentCountKey();
//             var sCustid = this.byId("sfCustid").getValue();
//             var sOrdno = this.byId("sfOrdno").getValue();
//             var oTable = this.byId(sTableId);
//             var oBinding = oTable.getBinding("items");
//             var oViewModel = this.getView().getModel("viewModel");

//             oBinding.filter([new Filter("Ordsts", FilterOperator.EQ, sOrdsts)]);

//             oBinding.attachEventOnce("dataReceived", function () {
//                 var iCount = 0;
//                 oTable.getItems().forEach((oItem) => {
//                     var sC = oItem.getBindingContext().getProperty("Custid").toUpperCase();
//                     var sO = oItem.getBindingContext().getProperty("Ordno").toUpperCase();
//                     var bCustid = sCustid ? sC.includes(sCustid.toUpperCase()) : true;
//                     var bOrdno = sOrdno ? sO.includes(sOrdno.toUpperCase()) : true;
//                     var bVisible = bCustid && bOrdno;
//                     oItem.setVisible(bVisible);
//                     if (bVisible) iCount++;
//                 });
//                 oViewModel.setProperty(sCountKey, iCount);
//             });
//         },

//         onSearch: function () {
//             this._applyFilter();
//         },

//         onReset: function () {
//             this.byId("sfCustid").setValue("");
//             this.byId("sfOrdno").setValue("");
//             this._applyFilter();
//         },

//         onValueHelpCustid: function () {
//             var sTableId = this._getCurrentTableId();
//             var oTable = this.byId(sTableId);
//             var aData = oTable.getItems()
//                 .filter((oItem) => oItem.getVisible())
//                 .map((oItem) => ({
//                     val: oItem.getBindingContext().getProperty("Custid")
//                 }));
//             var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);

//             this._openSelectDialog("고객ID 선택", aUnique, "sfCustid");
//         },

//         onValueHelpOrdno: function () {
//             var sTableId = this._getCurrentTableId();
//             var oTable = this.byId(sTableId);
//             var aData = oTable.getItems()
//                 .filter((oItem) => oItem.getVisible())
//                 .map((oItem) => ({
//                     val: oItem.getBindingContext().getProperty("Ordno")
//                 }));

//             this._openSelectDialog("오더번호 선택", aData, "sfOrdno");
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
//                         this._applyFilter();
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
//                                 this.byId("headerTable").getBinding("items").refresh();
//                                 this.byId("approvedTable").getBinding("items").filter([
//     new Filter("Ordsts", FilterOperator.EQ, "2")
// ]);
//                                 this._loadCount();
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
    "sap/m/StandardListItem"
], (Controller, MessageBox, MessageToast, JSONModel, Filter, FilterOperator, SelectDialog, StandardListItem) => {
    "use strict";

    return Controller.extend("code.zfmg2sd0001.controller.view", {

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
                    this.byId("headerTable").getBinding("items").filter([
                        new Filter("Ordsts", FilterOperator.EQ, "1")
                    ]);
                    this.byId("approvedTable").getBinding("items").filter([
                        new Filter("Ordsts", FilterOperator.EQ, "2")
                    ]);
                    this._loadCount();
                }
            });
        },

        _loadCount: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var oModel = this.getView().getModel();

            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, "1")],
                success: (iCount) => { oViewModel.setProperty("/pendingCount", iCount); },
                error: () => { oViewModel.setProperty("/pendingCount", 0); }
            });

            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, "2")],
                success: (iCount) => { oViewModel.setProperty("/approvedCount", iCount); },
                error: () => { oViewModel.setProperty("/approvedCount", 0); }
            });
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/isPendingTab", sKey === "pending");
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/mappingItems", []);
            oViewModel.setProperty("/selectedOrdno", "");

            this.byId("sfCustid").setValue("");
            this.byId("sfOrdno").setValue("");

            this._applyFilter();
        },

        _getCurrentTableId: function () {
            return this.byId("tabBar").getSelectedKey() === "pending" ? "headerTable" : "approvedTable";
        },

        _getCurrentOrdsts: function () {
            return this.byId("tabBar").getSelectedKey() === "pending" ? "1" : "2";
        },

        // _applyFilter: function () {
        //     var sKey = this.byId("tabBar").getSelectedKey();
        //     var sTableId = this._getCurrentTableId();
        //     var sOrdsts = this._getCurrentOrdsts();
        //     var sCustid = this.byId("sfCustid").getValue();
        //     var sOrdno = this.byId("sfOrdno").getValue();
        //     var oTable = this.byId(sTableId);
        //     var oBinding = oTable.getBinding("items");
        //     var oViewModel = this.getView().getModel("viewModel");

        //     oBinding.filter([new Filter("Ordsts", FilterOperator.EQ, sOrdsts)]);

        //     if (sKey === "pending") {
        //         oBinding.attachEventOnce("dataReceived", function () {
        //             var iCount = 0;
        //             oTable.getItems().forEach((oItem) => {
        //                 var sC = oItem.getBindingContext().getProperty("Custid").toUpperCase();
        //                 var sO = oItem.getBindingContext().getProperty("Ordno").toUpperCase();
        //                 var bCustid = sCustid ? sC.includes(sCustid.toUpperCase()) : true;
        //                 var bOrdno = sOrdno ? sO.includes(sOrdno.toUpperCase()) : true;
        //                 var bVisible = bCustid && bOrdno;
        //                 oItem.setVisible(bVisible);
        //                 if (bVisible) iCount++;
        //             });
        //             oViewModel.setProperty("/pendingCount", iCount);
        //         });
        //     } else {
        //         oBinding.attachEventOnce("dataReceived", function () {
        //             oTable.getItems().forEach((oItem) => {
        //                 var sC = oItem.getBindingContext().getProperty("Custid").toUpperCase();
        //                 var sO = oItem.getBindingContext().getProperty("Ordno").toUpperCase();
        //                 var bCustid = sCustid ? sC.includes(sCustid.toUpperCase()) : true;
        //                 var bOrdno = sOrdno ? sO.includes(sOrdno.toUpperCase()) : true;
        //                 oItem.setVisible(bCustid && bOrdno);
        //             });
        //             // 승인완료 건수는 $count 유지 (_loadCount로만 업데이트)
        //         });
        //     }
        // },

        _applyFilter: function () {
    var sKey = this.byId("tabBar").getSelectedKey();
    var sTableId = this._getCurrentTableId();
    var sOrdsts = this._getCurrentOrdsts();
    var sCustid = this.byId("sfCustid").getValue();
    var sOrdno = this.byId("sfOrdno").getValue();
    var oTable = this.byId(sTableId);
    var oBinding = oTable.getBinding("items");
    var oViewModel = this.getView().getModel("viewModel");
    var sCountKey = sKey === "pending" ? "/pendingCount" : "/approvedCount";
    var oModel = this.getView().getModel();

    oBinding.filter([new Filter("Ordsts", FilterOperator.EQ, sOrdsts)]);

    oBinding.attachEventOnce("dataReceived", function () {
        var iCount = 0;
        oTable.getItems().forEach((oItem) => {
            var sC = oItem.getBindingContext().getProperty("Custid").toUpperCase();
            var sO = oItem.getBindingContext().getProperty("Ordno").toUpperCase();
            var bCustid = sCustid ? sC.includes(sCustid.toUpperCase()) : true;
            var bOrdno = sOrdno ? sO.includes(sOrdno.toUpperCase()) : true;
            var bVisible = bCustid && bOrdno;
            oItem.setVisible(bVisible);
            if (bVisible) iCount++;
        });

        if (sCustid || sOrdno) {
            // 검색 조건 있으면 결과 건수로 업데이트
            oViewModel.setProperty(sCountKey, iCount);
        } else {
            // 검색 조건 없으면 $count로 전체 건수 복구
            oModel.read("/SalesOrderHeaderSet/$count", {
                filters: [new Filter("Ordsts", FilterOperator.EQ, sOrdsts)],
                success: (iTotalCount) => {
                    oViewModel.setProperty(sCountKey, iTotalCount);
                }
            });
        }
    });
},

// onReset: function () {
//     this.byId("sfCustid").setValue("");
//     this.byId("sfOrdno").setValue("");
//     this._applyFilter();
// },
        onSearch: function () {
            this._applyFilter();
        },

        onReset: function () {
            this.byId("sfCustid").setValue("");
            this.byId("sfOrdno").setValue("");
            this._applyFilter();
        },

        onValueHelpCustid: function () {
            var oTable = this.byId(this._getCurrentTableId());
            var aData = oTable.getItems()
                .filter((oItem) => oItem.getVisible())
                .map((oItem) => ({ val: oItem.getBindingContext().getProperty("Custid") }));
            var aUnique = aData.filter((v, i, a) => a.findIndex(t => t.val === v.val) === i);
            this._openSelectDialog("고객ID 선택", aUnique, "sfCustid");
        },

        onValueHelpOrdno: function () {
            var oTable = this.byId(this._getCurrentTableId());
            var aData = oTable.getItems()
                .filter((oItem) => oItem.getVisible())
                .map((oItem) => ({ val: oItem.getBindingContext().getProperty("Ordno") }));
            this._openSelectDialog("오더번호 선택", aData, "sfOrdno");
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
                        this._applyFilter();
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
        },

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

                            var bHasShortage = aMappingItems.some((o) => o.Stksts === 'N');
                            oViewModel.setProperty("/approveEnabled", !bHasShortage);
                        },
                        error: () => { MessageBox.error("실시간 재고 조회 오류"); }
                    });
                },
                error: () => { MessageBox.error("제품 소요 현황 조회 오류"); }
            });
        },

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
        }

    });
});