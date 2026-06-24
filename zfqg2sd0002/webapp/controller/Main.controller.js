


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

        formatPrice: function (sPrice) {
            if (!sPrice) return "0";
            return parseInt(sPrice).toLocaleString("ko-KR");
        },

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

            oModel.read("/ZCDS_G2_SD_0016", {
                filters: aFilters,
                success: (oData) => {
                    var aResults = oData.results;
                    var oViewModel = this.getView().getModel("viewModel");

                    aResults = aResults.map((o) => ({
                        ...o,
                        price: String(Math.round(parseFloat(o.price) * 100))
                    }));

                    oViewModel.setProperty("/headerItems", aResults);
                    oViewModel.setProperty("/headerCount", aResults.length);
                    oViewModel.setProperty("/itemItems", []);
                    oViewModel.setProperty("/itemCount", 0);

                    this._buildChartData(aResults);
                    this._buildKpiData(aResults);

                    var oVizFrame = this.byId("vizChart");
                   var aChartData = oViewModel.getProperty("/chartData");
var aTop3 = aChartData.filter((o) => o.rank === "TOP 3").map((o) => o.subjnm);
var aOthers = aChartData.filter((o) => o.rank !== "TOP 3").map((o) => o.subjnm);

var aRules = aTop3.map((sName) => ({
    dataContext: [{ "과목명": sName }],
    properties: { color: "#e9730c" },
    displayName: "TOP 3"
}));

aOthers.forEach((sName) => {
    aRules.push({
        dataContext: [{ "과목명": sName }],
        properties: { color: "#0070f2" },
        displayName: "일반"
    });
});

oVizFrame.setVizProperties({
    title: { text: "과목별 평균가격" },
    plotArea: {
        dataLabel: { visible: true, formatString: "#,##0" },
        dataPointStyle: {
            rules: aRules
        }
    },
     legend: { visible: false },
    tooltip: { visible: true },
    valueAxis: { label: { formatString: "#,##0" } }
});
                },
                error: () => {
                    MessageBox.error("패키지 데이터 조회 오류");
                }
            });
        },

        onTileActivePress: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");

            var aFilters = [new Filter("salsts", FilterOperator.EQ, "1")];

            var sPackcd = this.byId("inputPackcd").getValue().trim();
            var sPacknm = this.byId("inputPacknm").getValue().trim();
            var sFrom   = this.byId("inputPackymFrom").getValue().trim();
            var sTo     = this.byId("inputPackymTo").getValue().trim();

            if (sPackcd) aFilters.push(new Filter("packcd", FilterOperator.EQ, sPackcd));
            if (sPacknm) aFilters.push(new Filter("packnm", FilterOperator.Contains, sPacknm));
            if (sFrom && sTo) {
                aFilters.push(new Filter("packym", FilterOperator.BT, sFrom, sTo));
            } else {
                var sYear = new Date().getFullYear().toString();
                aFilters.push(new Filter("packym", FilterOperator.BT, sYear + "01", sYear + "12"));
            }

            oModel.read("/ZCDS_G2_SD_0016", {
                filters: aFilters,
                success: (oData) => {
                    var aResults = oData.results.map((o) => ({
                        ...o,
                        price: String(Math.round(parseFloat(o.price) * 100))
                    }));

                    oViewModel.setProperty("/headerItems", aResults);
                    oViewModel.setProperty("/headerCount", aResults.length);
                    oViewModel.setProperty("/itemItems", []);
                    oViewModel.setProperty("/itemCount", 0);

                    setTimeout(() => {
                        var oDomRef = this.byId("headerPanel").getDomRef();
                        if (oDomRef) {
                            oDomRef.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    }, 300);
                },
                error: () => {
                    MessageBox.error("패키지 데이터 조회 오류");
                }
            });
        },

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

            aChartData.sort((a, b) => b.avgPrice - a.avgPrice);
            aChartData = aChartData.map((o, i) => ({
                ...o,
                rank: i < 3 ? "TOP 3" : "일반"
            }));

            this.getView().getModel("viewModel").setProperty("/chartData", aChartData);
        },

        _buildKpiData: function (aResults) {
            var oViewModel = this.getView().getModel("viewModel");

            var iActive = aResults.filter((o) => o.salsts === "1").length;
            var aSubjects = [...new Set(aResults.map((o) => o.subjcd).filter(Boolean))];
            var fTotal = aResults.reduce((acc, o) => acc + (parseFloat(o.price) || 0), 0);
            var iAvg = aResults.length > 0 ? Math.round(fTotal / aResults.length) : 0;

            oViewModel.setProperty("/kpiActive", iActive);
            oViewModel.setProperty("/kpiSubject", aSubjects.length);
            oViewModel.setProperty("/kpiAvgPrice", iAvg.toLocaleString("ko-KR"));
        },

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
                error: () => {
                    MessageBox.error("구성 제품 조회 오류");
                }
            });
        },

        onChartSelect: function (oEvent) {
            var aData = oEvent.getParameter("data");
            if (!aData || aData.length === 0) return;

            var sSubjnm = aData[0].data["과목명"];
            if (!sSubjnm) return;

            this.byId("vizChart").vizSelection([], { clearSelection: true });

            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");

            var aFilters = [new Filter("subjnm", FilterOperator.EQ, sSubjnm)];

            var sPackcd = this.byId("inputPackcd").getValue().trim();
            var sPacknm = this.byId("inputPacknm").getValue().trim();
            var sFrom   = this.byId("inputPackymFrom").getValue().trim();
            var sTo     = this.byId("inputPackymTo").getValue().trim();
            var sSalsts = this.byId("selectSalsts").getSelectedKey();

            if (sPackcd) aFilters.push(new Filter("packcd", FilterOperator.EQ, sPackcd));
            if (sPacknm) aFilters.push(new Filter("packnm", FilterOperator.Contains, sPacknm));
            if (sFrom && sTo) {
                aFilters.push(new Filter("packym", FilterOperator.BT, sFrom, sTo));
            } else {
                var sYear = new Date().getFullYear().toString();
                aFilters.push(new Filter("packym", FilterOperator.BT, sYear + "01", sYear + "12"));
            }
            if (sSalsts) aFilters.push(new Filter("salsts", FilterOperator.EQ, sSalsts));

            oModel.read("/ZCDS_G2_SD_0016", {
                filters: aFilters,
                success: (oData) => {
                    var aResults = oData.results.map((o) => ({
                        ...o,
                        price: String(Math.round(parseFloat(o.price) * 100))
                    }));

                    oViewModel.setProperty("/headerItems", aResults);
                    oViewModel.setProperty("/headerCount", aResults.length);
                    oViewModel.setProperty("/itemItems", []);
                    oViewModel.setProperty("/itemCount", 0);

                    setTimeout(() => {
                        var oDomRef = this.byId("headerPanel").getDomRef();
                        if (oDomRef) {
                            oDomRef.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    }, 300);
                },
                error: () => {
                    MessageBox.error("패키지 데이터 조회 오류");
                }
            });
        },

        onTileChartPress: function () {
            var oDomRef = this.byId("chartPanel").getDomRef();
            if (oDomRef) {
                oDomRef.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },

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
            oViewModel.setProperty("/chartData", []);
            oViewModel.setProperty("/kpiActive", 0);
            oViewModel.setProperty("/kpiSubject", 0);
            oViewModel.setProperty("/kpiAvgPrice", 0);
        }
    });
});


