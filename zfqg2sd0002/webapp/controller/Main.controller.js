// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast"
// ], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
//     "use strict";

//     return Controller.extend("code.zfqg2sd0002.controller.Main", {
      
//         onInit: function () {
//             var oViewModel = new JSONModel({
//                     headerItems: [],
//                     headerCount: 0,
//                     itemItems: [],
//                     itemCount: 0,
//                     itemVisible: false,
//                     chartData: [],
//                     kpiActive: 0,
//                     kpiSubject: 0,
//                     kpiAvgPrice: 0

                    
//         });
//             this.getView().setModel(oViewModel, "viewModel");
//         },

//         /**
//          * 조회 버튼
//          */
//         onSearch: function () {
//             console.log("onSearch 호출됨");
//             var oModel = this.getView().getModel();
//             console.log("oModel:", oModel);
//             var aFilters = [];

//             var sPackcd  = this.byId("inputPackcd").getValue().trim();
//             var sPacknm  = this.byId("inputPacknm").getValue().trim();
//             var sFrom    = this.byId("inputPackymFrom").getValue().trim();
//             var sTo      = this.byId("inputPackymTo").getValue().trim();
//             var sSalsts  = this.byId("selectSalsts").getSelectedKey();

//             if (sPackcd) aFilters.push(new Filter("packcd", FilterOperator.EQ, sPackcd));
//             if (sPacknm) aFilters.push(new Filter("packnm", FilterOperator.Contains, sPacknm));
//             if (sFrom && sTo) aFilters.push(new Filter("packym", FilterOperator.BT, sFrom, sTo));
//             else if (sFrom)   aFilters.push(new Filter("packym", FilterOperator.EQ, sFrom));
//             if (sSalsts) aFilters.push(new Filter("salsts", FilterOperator.EQ, sSalsts));

//             oModel.read("/ZCDS_G2_SD_0016", {
//                 filters: aFilters,
//                success: (oData) => {
//                 var aResults = oData.results;
//                 var oViewModel = this.getView().getModel("viewModel");

//                 aResults = aResults.map((o) => ({
//                     ...o,
//                     price: String(Math.round(parseFloat(o.price) * 100))
//                 }));

//                 console.log("변환 후 첫번째 price:", aResults[0].price);
//                 // price: String(Math.round(parseFloat(o.price) * 100))
//                 oViewModel.setProperty("/headerItems", aResults);
//                 oViewModel.setProperty("/headerCount", aResults.length);
//                 oViewModel.setProperty("/itemItems", []);
//                 oViewModel.setProperty("/itemCount", 0);
//                 oViewModel.setProperty("/itemVisible", false);

//                 this._buildChartData(aResults);

//                 var oVizFrame = this.byId("vizChart");
                
//                 oVizFrame.setVizProperties({
//                     title: {
//                         text: "과목별 평균가격"
//                     },
//                     plotArea: {
                      
//                         dataLabel: {
//                             visible: true,
//                             formatString: "#,##0"
//                         }
//                     },
//                     tooltip: {
//                         visible: true
//                     },
//                     valueAxis: {
//                         label: {
//                             formatString: "#,##0"
//                         }
//                     }
//                 });

//                 this._buildKpiData(aResults);

//             },
//                 error: () => {
//                      console.log("조회 실패:", oError);
//                      console.log("에러 텍스트:", oError.responseText);
//                     MessageBox.error("패키지 데이터 조회 오류");
//                 }
//             });
//         },

//         /**
//          * 과목별 평균가격 집계
//          */
//             _buildChartData: function (aResults) {
//                 var oMap = {};
//                 aResults.forEach((o) => {
//                     var sKey = o.subjnm || o.subjcd || "기타";
//                     var fPrice = (parseFloat(o.price) || 0);
//                     if (!oMap[sKey]) oMap[sKey] = { sum: 0, cnt: 0 };
//                     oMap[sKey].sum += fPrice;
//                     oMap[sKey].cnt += 1;
//                 });

//                 var aChartData = Object.keys(oMap).map((k) => ({
//                     subjnm: k,
//                     avgPrice: Math.round(oMap[k].sum / oMap[k].cnt)
//                 }));

//                 console.log("차트 데이터:", aChartData);
//                 this.getView().getModel("viewModel").setProperty("/chartData", aChartData);
//             },


//             // _buildKpiData: function (aResults) {
//             //     var oViewModel = this.getView().getModel("viewModel");

//             //     // 판매중 패키지 수
//             //     var iActive = aResults.filter((o) => o.salsts === "1").length;

//             //     // 과목 수 (중복 제거)
//             //     var aSubjects = [...new Set(aResults.map((o) => o.subjcd).filter(Boolean))];

//             //     // 전체 평균가격
//             //     var fTotal = aResults.reduce((acc, o) => acc + ((parseFloat(o.price) || 0) * 100), 0);
//             //     var iAvg = aResults.length > 0 ? Math.round(fTotal / aResults.length) : 0;

//             //     oViewModel.setProperty("/kpiActive", iActive);
//             //     oViewModel.setProperty("/kpiSubject", aSubjects.length);
//             //     oViewModel.setProperty("/kpiAvgPrice", iAvg);
//             // },

//            _buildKpiData: function (aResults) {
//                 var oViewModel = this.getView().getModel("viewModel");

//                 var iActive = aResults.filter((o) => o.salsts === "1").length;

//                 var aSubjects = [...new Set(aResults.map((o) => o.subjcd).filter(Boolean))];

//                 // 전체 aResults 기준 평균가격
//                 var fTotal = aResults.reduce((acc, o) => acc + (parseFloat(o.price) || 0), 0);
//                 var iAvg = aResults.length > 0 ? Math.round(fTotal / aResults.length) : 0;

//                 console.log("총합:", fTotal, "건수:", aResults.length, "평균:", iAvg);

//                 oViewModel.setProperty("/kpiActive", iActive);
//                 oViewModel.setProperty("/kpiSubject", aSubjects.length);
//                 oViewModel.setProperty("/kpiAvgPrice", iAvg.toLocaleString("ko-KR"));
//             },
//         /**
//          * 헤더 행 클릭 → 아이템 조회
//          */
//         // onHeaderSelect: function (oEvent) {
//         //     var oItem = oEvent.getParameter("listItem");
//         //     if (!oItem) return;

//         //         var oContext = oItem.getBindingContext("viewModel");
//         //         console.log("선택된 컨텍스트:", oContext);
//         //         var oData = oContext.getObject();
//         //         console.log("선택된 데이터:", oData);

//         //     var oData   = oItem.getBindingContext("viewModel").getObject();
//         //     var sPackcd = oData.Packcd;
//         //     var sPackym = oData.Packym;

//         //     var oModel = this.getView().getModel();
//         //     oModel.read("/ZCDS_G2_SD_0017", {
//         //         filters: [
//         //             new Filter("Packcd", FilterOperator.EQ, sPackcd),
//         //             new Filter("Packym", FilterOperator.EQ, sPackym)
//         //         ],
//         //         success: (oData) => {
//         //             var aItems = oData.results;
//         //             var oViewModel = this.getView().getModel("viewModel");
//         //             oViewModel.setProperty("/itemItems", aItems);
//         //             oViewModel.setProperty("/itemCount", aItems.length);
//         //             oViewModel.setProperty("/itemVisible", true);
//         //         },
//         //         error: () => {
//         //             MessageBox.error("구성 제품 조회 오류");
//         //         }
//         //     });
//         // },

//         onHeaderSelect: function (oEvent) {
//     var oItem = oEvent.getParameter("listItem");
//     if (!oItem) return;

//     var oContext = oItem.getBindingContext("viewModel");
//     if (!oContext) return;
//     var oData   = oContext.getObject();
//     var sPackcd = oData.packcd;
//     var sPackym = oData.packym;

//     console.log("선택:", sPackcd, sPackym);

//     var oModel = this.getView().getModel();
//     oModel.read("/ZCDS_G2_SD_0017", {
//         filters: [
//             new Filter("packcd", FilterOperator.EQ, sPackcd),
//             new Filter("packym", FilterOperator.EQ, sPackym)
//         ],
//         success: (oData) => {
//             var aItems = oData.results;
//             console.log("아이템 조회 성공:", aItems);
//             var oViewModel = this.getView().getModel("viewModel");
//             oViewModel.setProperty("/itemItems", aItems);
//             oViewModel.setProperty("/itemCount", aItems.length);
//             oViewModel.setProperty("/itemVisible", true);
//         },
//         error: (oError) => {
//             console.log("아이템 조회 오류:", oError.responseText);
//             MessageBox.error("구성 제품 조회 오류");
//         }
//     });
// },

// formatPrice: function (sPrice) {
//     if (!sPrice) return "0";
//     return parseInt(sPrice).toLocaleString("ko-KR");
// },

//         /**
//          * 초기화 버튼
//          */
//         onReset: function () {
//             this.byId("inputPackcd").setValue("");
//             this.byId("inputPacknm").setValue("");
//             this.byId("inputPackymFrom").setValue("");
//             this.byId("inputPackymTo").setValue("");
//             this.byId("selectSalsts").setSelectedKey("");

//             var oViewModel = this.getView().getModel("viewModel");
//             oViewModel.setProperty("/headerItems", []);
//             oViewModel.setProperty("/headerCount", 0);
//             oViewModel.setProperty("/itemItems", []);
//             oViewModel.setProperty("/itemCount", 0);
//             oViewModel.setProperty("/itemVisible", false);
//             oViewModel.setProperty("/chartData", []);
//             oViewModel.setProperty("/kpiActive", 0);
//             oViewModel.setProperty("/kpiSubject", 0);
//             oViewModel.setProperty("/kpiAvgPrice", 0);
//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("code.zfqg2sd0002.controller.Main", {

        onInit: function () {
            var oViewModel = new JSONModel({
                headerItems: [],
                headerCount: 0,
                itemItems: [],
                itemCount: 0,
                itemVisible: true,
                chartData: [],
                kpiActive: 0,
                kpiSubject: 0,
                kpiAvgPrice: 0
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        /**
         * 가격 천단위 콤마 포맷터
         */
        formatPrice: function (sPrice) {
            if (!sPrice) return "0";
            return parseInt(sPrice).toLocaleString("ko-KR");
        },

        /**
         * 조회 버튼
         */
        onSearch: function () {
            var oModel = this.getView().getModel();
            var aFilters = [];

            var sPackcd = this.byId("inputPackcd").getValue().trim();
            var sPacknm = this.byId("inputPacknm").getValue().trim();
            var sFrom   = this.byId("inputPackymFrom").getValue().trim();
            var sTo     = this.byId("inputPackymTo").getValue().trim();
            var sSalsts = this.byId("selectSalsts").getSelectedKey();

            if (sPackcd) aFilters.push(new Filter("packcd", FilterOperator.EQ, sPackcd));
            if (sPacknm) aFilters.push(new Filter("packnm", FilterOperator.Contains, sPacknm));

            if (sFrom && sTo) {
                aFilters.push(new Filter("packym", FilterOperator.BT, sFrom, sTo));
                } else if (sFrom) {
                    var sYear = new Date().getFullYear().toString();
                    aFilters.push(new Filter("packym", FilterOperator.BT, sFrom, sYear + "12"));
                } else if (sTo) {
                    var sYear = new Date().getFullYear().toString();
                    aFilters.push(new Filter("packym", FilterOperator.BT, sYear + "01", sTo));
                } else {
                    var sYear = new Date().getFullYear().toString();
                    aFilters.push(new Filter("packym", FilterOperator.BT, sYear + "01", sYear + "12"));
                }

            if (sSalsts) aFilters.push(new Filter("salsts", FilterOperator.EQ, sSalsts));
                    console.log("필터:", JSON.stringify(aFilters.map(f => ({path: f.sPath, op: f.sOperator, val1: f.oValue1, val2: f.oValue2}))));
                        oModel.read("/ZCDS_G2_SD_0016", {
                            filters: aFilters,
                            success: (oData) => {
                                var aResults = oData.results;
                                var oViewModel = this.getView().getModel("viewModel");

                                // price 100 곱하기
                                aResults = aResults.map((o) => ({
                                    ...o,
                                    price: String(Math.round(parseFloat(o.price) * 100))
                                }));

                    oViewModel.setProperty("/headerItems", aResults);
                    oViewModel.setProperty("/headerCount", aResults.length);
                    oViewModel.setProperty("/itemItems", []);
                    oViewModel.setProperty("/itemCount", 0);
                    //oViewModel.setProperty("/itemVisible", false);

                    this._buildChartData(aResults);
                    this._buildKpiData(aResults);

                    // 차트 제목 및 속성 설정
                    var oVizFrame = this.byId("vizChart");
                    oVizFrame.setVizProperties({
                        title: { text: "과목별 평균가격" },
                        plotArea: {
                            dataLabel: {
                                visible: true,
                                formatString: "#,##0"
                            }
                        },
                        tooltip: { visible: true },
                        valueAxis: {
                            label: { formatString: "#,##0" }
                        }
                    });
                },
                error: () => {
                    MessageBox.error("패키지 데이터 조회 오류");
                }
            });
        },

        onTileActivePress: function () {
    var oDomRef = this.byId("headerPanel").getDomRef();
    if (oDomRef) {
        oDomRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
},

        /**
         * 과목별 평균가격 차트 데이터 집계
         */
        _buildChartData: function (aResults) {
            var oMap = {};
            aResults.forEach((o) => {
                var sKey = o.subjnm || o.subjcd || "기타";
                var fPrice = parseFloat(o.price) || 0;
                if (!oMap[sKey]) oMap[sKey] = { sum: 0, cnt: 0 };
                oMap[sKey].sum += fPrice;
                oMap[sKey].cnt += 1;
            });

            var aChartData = Object.keys(oMap).map((k) => ({
                subjnm: k,
                avgPrice: Math.round(oMap[k].sum / oMap[k].cnt)
            }));

            this.getView().getModel("viewModel").setProperty("/chartData", aChartData);
        },

        /**
         * KPI 데이터 집계
         */
        _buildKpiData: function (aResults) {
            var oViewModel = this.getView().getModel("viewModel");

            // 판매중 패키지 수
            var iActive = aResults.filter((o) => o.salsts === "1").length;

            // 과목 수 (중복 제거)
            var aSubjects = [...new Set(aResults.map((o) => o.subjcd).filter(Boolean))];

            // 전체 평균가격
            var fTotal = aResults.reduce((acc, o) => acc + (parseFloat(o.price) || 0), 0);
            var iAvg = aResults.length > 0 ? Math.round(fTotal / aResults.length) : 0;

            oViewModel.setProperty("/kpiActive", iActive);
            oViewModel.setProperty("/kpiSubject", aSubjects.length);
            oViewModel.setProperty("/kpiAvgPrice", iAvg.toLocaleString("ko-KR"));
        },

        /**
         * 헤더 행 클릭 → 아이템 조회
         */
        onHeaderSelect: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            if (!oItem) return;

            var oContext = oItem.getBindingContext("viewModel");
            if (!oContext) return;
            var oData   = oContext.getObject();
            var sPackcd = oData.packcd;
            var sPackym = oData.packym;

            var oModel = this.getView().getModel();
            oModel.read("/ZCDS_G2_SD_0017", {
                filters: [
                    new Filter("packcd", FilterOperator.EQ, sPackcd),
                    new Filter("packym", FilterOperator.EQ, sPackym)
                ],
                success: (oData) => {
                    var aItems = oData.results;
                    var oViewModel = this.getView().getModel("viewModel");
                    oViewModel.setProperty("/itemItems", aItems);
                    oViewModel.setProperty("/itemCount", aItems.length);
                    oViewModel.setProperty("/itemVisible", true);
                },
                error: (oError) => {
                    MessageBox.error("구성 제품 조회 오류");
                }
            });
        },

        onTileChartPress: function () {
            var oDomRef = this.byId("chartPanel").getDomRef();
            if (oDomRef) {
                oDomRef.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },

        /**
         * 패키지 코드 서치헬프
         */
        onPackcdValueHelp: function () {
            var oModel = this.getView().getModel();
            oModel.read("/ZCDS_G2_SD_0016", {
                success: (oData) => {
                    var aUnique = [];
                    var oSeen = {};
                    oData.results.forEach((o) => {
                        if (!oSeen[o.packcd]) {
                            oSeen[o.packcd] = true;
                            aUnique.push({ packcd: o.packcd, packnm: o.packnm });
                        }
                    });

                    var oSelectDialog = new sap.m.SelectDialog({
                        title: "패키지 코드 선택",
                        items: {
                            path: "/items",
                            template: new sap.m.StandardListItem({
                                title: "{packcd}",
                                description: "{packnm}"
                            })
                        },
                        confirm: (oEvent) => {
                            var oSelected = oEvent.getParameter("selectedItem");
                            if (oSelected) {
                                this.byId("inputPackcd").setValue(oSelected.getTitle());
                            }
                            oSelectDialog.destroy();
                        },
                        cancel: () => { oSelectDialog.destroy(); },
                        search: (oEvent) => {
                            var sVal = oEvent.getParameter("value").toLowerCase();
                            var oFilter = new Filter([
                                new Filter("packcd", FilterOperator.Contains, sVal),
                                new Filter("packnm", FilterOperator.Contains, sVal)
                            ], false);
                            oEvent.getParameter("itemsBinding").filter([oFilter]);
                        }
                    });

                    var oDialogModel = new JSONModel({ items: aUnique });
                    oSelectDialog.setModel(oDialogModel);
                    oSelectDialog.open();
                }
            });
        },

        /**
         * 패키지 명 서치헬프
         */
        onPacknmValueHelp: function () {
            var oModel = this.getView().getModel();
            oModel.read("/ZCDS_G2_SD_0016", {
                success: (oData) => {
                    var aUnique = [];
                    var oSeen = {};
                    oData.results.forEach((o) => {
                        if (!oSeen[o.packnm]) {
                            oSeen[o.packnm] = true;
                            aUnique.push({ packcd: o.packcd, packnm: o.packnm });
                        }
                    });

                    var oSelectDialog = new sap.m.SelectDialog({
                        title: "패키지 명 선택",
                        items: {
                            path: "/items",
                            template: new sap.m.StandardListItem({
                                title: "{packnm}",
                                description: "{packcd}"
                            })
                        },
                        confirm: (oEvent) => {
                            var oSelected = oEvent.getParameter("selectedItem");
                            if (oSelected) {
                                this.byId("inputPacknm").setValue(oSelected.getTitle());
                            }
                            oSelectDialog.destroy();
                        },
                        cancel: () => { oSelectDialog.destroy(); },
                        search: (oEvent) => {
                            var sVal = oEvent.getParameter("value").toLowerCase();
                            var oFilter = new Filter([
                                new Filter("packnm", FilterOperator.Contains, sVal),
                                new Filter("packcd", FilterOperator.Contains, sVal)
                            ], false);
                            oEvent.getParameter("itemsBinding").filter([oFilter]);
                        }
                    });

                    var oDialogModel = new JSONModel({ items: aUnique });
                    oSelectDialog.setModel(oDialogModel);
                    oSelectDialog.open();
                }
            });
        },

        /**
         * 초기화 버튼
         */
        onReset: function () {
            this.byId("inputPackcd").setValue("");
            this.byId("inputPacknm").setValue("");
            this.byId("inputPackymFrom").setValue("");
            this.byId("inputPackymTo").setValue("");
            this.byId("selectSalsts").setSelectedKey("");

            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/headerItems", []);
            oViewModel.setProperty("/headerCount", 0);
            oViewModel.setProperty("/itemItems", []);
            oViewModel.setProperty("/itemCount", 0);
            //oViewModel.setProperty("/itemVisible", false);
            oViewModel.setProperty("/chartData", []);
            oViewModel.setProperty("/kpiActive", 0);
            oViewModel.setProperty("/kpiSubject", 0);
            oViewModel.setProperty("/kpiAvgPrice", 0);
        }
    });
});