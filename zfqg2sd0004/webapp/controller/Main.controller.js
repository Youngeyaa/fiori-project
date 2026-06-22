sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("code.zfqg2sd0004.controller.Main", {

        onInit: function () {
            var oViewModel = new JSONModel({
                orderItems: [],
                orderCount: 0,
                chartData: [],
                kpiTotamt: 0,
                kpiOrdCnt: 0,
                kpiApvCnt: 0,
                compareEnabled: false,
                compareMode: false,
                compareVisible: false,
                kpiGrowth: 0,
                kpiGrowthColor: "Neutral"
            });
            this.getView().setModel(oViewModel, "viewModel");

            this.getView().addEventDelegate({
                onAfterRendering: () => {
                    var oVizFrame = this.byId("vizChart");
                    var oPopover = this.byId("popover");
                    oPopover.connect(oVizFrame.getVizUid());
                }
            });
        },

        formatAmount: function (sVal) {
            if (!sVal) return "0";
            return parseInt(sVal).toLocaleString("ko-KR");
        },

        /**
         * 공통 필터 생성
         */
        _getFilters: function () {
    var sFrom   = this.byId("inputOrdymFrom").getValue().trim();
    var sTo     = this.byId("inputOrdymTo").getValue().trim();
    var sCustid = this.byId("inputCustid").getValue().trim();
    var sOrdsts = this.byId("selectOrdsts").getSelectedKey();
    var sYear   = new Date().getFullYear().toString();
    var aFilters = [];

    var sFromYear = sFrom ? sFrom.slice(0, 4) : sYear;
    var sToYear   = sTo   ? sTo.slice(0, 4)   : sYear;

    // 단일 년도 여부 판단 → 전년동기 비교 버튼 활성화
    var bSingleYear = sFromYear === sToYear;
    this.getView().getModel("viewModel").setProperty("/compareEnabled", bSingleYear);

    if (sFrom && sTo) {
        aFilters.push(new Filter("ordym", FilterOperator.BT, sFrom, sTo));
    } else if (sFrom) {
        aFilters.push(new Filter("ordym", FilterOperator.BT, sFrom, sFromYear + "12"));
    } else if (sTo) {
        aFilters.push(new Filter("ordym", FilterOperator.BT, sToYear + "01", sTo));
    } else {
        aFilters.push(new Filter("ordym", FilterOperator.BT, sYear + "01", sYear + "12"));
    }

    if (sCustid) aFilters.push(new Filter("custid", FilterOperator.EQ, sCustid));
    if (sOrdsts) aFilters.push(new Filter("ordsts", FilterOperator.EQ, sOrdsts));

    return aFilters;
},
        /**
         * 조회 버튼 - 올해 데이터만
         */
        onSearch: function () {
            var oModel   = this.getView().getModel();
            var aFilters = this._getFilters();
            var sYear    = new Date().getFullYear().toString();

            oModel.read("/ZCDS_G2_SD_0018", {
                filters: aFilters,
                success: (oData) => {
                    var aResults = oData.results;
                    var oViewModel = this.getView().getModel("viewModel");

                    aResults = aResults.map((o) => ({
                        ...o,
                        totamt: String(Math.round(parseFloat(o.totamt) * 100))
                    }));

                    oViewModel.setProperty("/orderItems", aResults);
                    oViewModel.setProperty("/orderCount", aResults.length);
                    this._buildKpiData(aResults);

                    // 년도별로 분리해서 차트 데이터 생성
                    var oYearMap = {};
                    aResults.forEach((o) => {
                        var sYr  = (o.ordym || "").slice(0, 4);
                        var sMon = (o.ordym || "").slice(4);
                        if (!oYearMap[sYr]) oYearMap[sYr] = {};
                        if (!oYearMap[sYr][sMon]) oYearMap[sYr][sMon] = 0;
                        oYearMap[sYr][sMon] += parseFloat(o.totamt) || 0;
                    });

                    var aChartData = [];
                    var aYears = Object.keys(oYearMap).sort();
                    aYears.forEach((sYr) => {
                        Object.keys(oYearMap[sYr]).sort().forEach((sMon) => {
                            aChartData.push({
                                month: sYr + "-" + sMon + "월",
                                series: sYr,
                                amount: Math.round(oYearMap[sYr][sMon])
                            });
                        });
                    });

                    oViewModel.setProperty("/chartData", aChartData);

                    // 차트 제목
                    var sFromYear = aResults.length > 0 ? (aResults[0].ordym || "").slice(0, 4) : sYear;
                    var sToYear   = aResults.length > 0 ? (aResults[aResults.length - 1].ordym || "").slice(0, 4) : sYear;
                    var sTitle    = sFromYear === sToYear
                                    ? "월별 매출 추이 (" + sFromYear + ")"
                                    : "월별 매출 추이 (" + sFromYear + "~" + sToYear + ")";

                    var oVizFrame = this.byId("vizChart");
                    oVizFrame.setVizProperties({
                        title: { text: sTitle },
                        plotArea: { dataLabel: { visible: false } },
                        tooltip: { visible: true, formatString: "#,##0" },
                        valueAxis: { label: { formatString: "#,##0" } },
                        legend: { visible: aYears.length > 1 }
                    });

                    this.getView().getModel("viewModel").setProperty("/compareMode", false);
                    this.getView().getModel("viewModel").setProperty("/compareVisible", false);

                },
                error: () => {
                    MessageBox.error("데이터 조회 오류");
                }
            });
        },

        /**
         * 전년동기 비교 버튼
         */
       onCompare: function () {
    var oViewModel = this.getView().getModel("viewModel");
    var bCompareMode = oViewModel.getProperty("/compareMode");

    if (bCompareMode) {
        oViewModel.setProperty("/compareMode", false);
        oViewModel.setProperty("/compareVisible", false);
        this.onSearch();
        return;
    }

    var oModel   = this.getView().getModel();
    var aFilters = this._getFilters();
    var sCustid  = this.byId("inputCustid").getValue().trim();
    var sOrdsts  = this.byId("selectOrdsts").getSelectedKey();

    oModel.read("/ZCDS_G2_SD_0018", {
        filters: aFilters,
        success: (oData) => {
            var aResults = oData.results;

            aResults = aResults.map((o) => ({
                ...o,
                totamt: String(Math.round(parseFloat(o.totamt) * 100))
            }));

            oViewModel.setProperty("/orderItems", aResults);
            oViewModel.setProperty("/orderCount", aResults.length);
            this._buildKpiData(aResults);

            // 실제 데이터 기준 년도 파악
            var aMonths = aResults.map((o) => o.ordym).filter(Boolean).sort();
            var sMinYm   = aMonths[0] || "";
            var sMaxYm   = aMonths[aMonths.length - 1] || "";
            var sDataYear = sMinYm.slice(0, 4);
            var sLastYear = String(parseInt(sDataYear) - 1);
            var sMinMon  = sMinYm.slice(4);
            var sMaxMon  = sMaxYm.slice(4);

            var aLastFilters = [
                new Filter("ordym", FilterOperator.BT, sLastYear + sMinMon, sLastYear + sMaxMon)
            ];
            if (sCustid) aLastFilters.push(new Filter("custid", FilterOperator.EQ, sCustid));
            if (sOrdsts) aLastFilters.push(new Filter("ordsts", FilterOperator.EQ, sOrdsts));

            oModel.read("/ZCDS_G2_SD_0018", {
                filters: aLastFilters,
                success: (oLastData) => {
                    var aLastResults = oLastData.results.map((o) => ({
                        ...o,
                        totamt: String(Math.round(parseFloat(o.totamt) * 100))
                    }));

                    var oThis = {};
                    var oLast = {};

                    aResults.forEach((o) => {
                        var sMon = (o.ordym || "").slice(4);
                        if (!oThis[sMon]) oThis[sMon] = 0;
                        oThis[sMon] += parseFloat(o.totamt) || 0;
                    });

                    aLastResults.forEach((o) => {
                        var sMon = (o.ordym || "").slice(4);
                        if (!oLast[sMon]) oLast[sMon] = 0;
                        oLast[sMon] += parseFloat(o.totamt) || 0;
                    });

                    var aChartData = [];
                    Object.keys(oThis).sort().forEach((sMon) => {
                        aChartData.push({
                            month: sMon + "월",
                            series: sDataYear,
                            amount: Math.round(oThis[sMon] || 0)
                        });
                        aChartData.push({
                            month: sMon + "월",
                            series: sLastYear,
                            amount: Math.round(oLast[sMon] || 0)
                        });
                    });

                    oViewModel.setProperty("/chartData", aChartData);

                    // 증감률 계산
                    var fThisTotal = aResults.reduce((acc, o) => acc + (parseFloat(o.totamt) || 0), 0);
                    var fLastTotal = aLastResults.reduce((acc, o) => acc + (parseFloat(o.totamt) || 0), 0);
                    var fGrowth = fLastTotal > 0
                        ? Math.round((fThisTotal - fLastTotal) / fLastTotal * 100 * 10) / 10
                        : 0;

                    oViewModel.setProperty("/kpiGrowth", fGrowth);
                    oViewModel.setProperty("/kpiGrowthColor", fGrowth >= 0 ? "Good" : "Critical");
                    oViewModel.setProperty("/compareMode", true);
                    oViewModel.setProperty("/compareVisible", true);

                    var oVizFrame = this.byId("vizChart");
                    oVizFrame.setVizProperties({
                        title: { text: "월별 매출 추이 (" + sDataYear + " vs " + sLastYear + ")" },
                        plotArea: { dataLabel: { visible: false } },
                        tooltip: { visible: true, formatString: "#,##0" },
                        valueAxis: { label: { formatString: "#,##0" } },
                        legend: { visible: true }
                    });
                },
                error: () => {
                    MessageBox.error("전년도 데이터 조회 오류");
                }
            });
        },
        error: () => {
            MessageBox.error("데이터 조회 오류");
        }
    });
},

        _buildKpiData: function (aResults) {
            var oViewModel = this.getView().getModel("viewModel");
            var fTotal  = aResults.reduce((acc, o) => acc + (parseFloat(o.totamt) || 0), 0);
            var iOrdCnt = aResults.length;
            var iApvCnt = aResults.filter((o) => o.ordsts === "2").length;

            oViewModel.setProperty("/kpiTotamt", Math.round(fTotal));
            oViewModel.setProperty("/kpiOrdCnt", iOrdCnt);
            oViewModel.setProperty("/kpiApvCnt", iApvCnt);
            oViewModel.setProperty("/kpiTotamt", Math.round(fTotal).toLocaleString("ko-KR"));
        },

        onCustidValueHelp: function () {
            var oModel = this.getView().getModel();
            oModel.read("/ZCDS_G2_SD_0018", {
                success: (oData) => {
                    var aUnique = [];
                    var oSeen = {};
                    oData.results.forEach((o) => {
                        if (!oSeen[o.custid]) {
                            oSeen[o.custid] = true;
                            aUnique.push({ custid: o.custid, custnm: o.custnm });
                        }
                    });

                    var oSelectDialog = new sap.m.SelectDialog({
                        title: "고객 ID 선택",
                        items: {
                            path: "/items",
                            template: new sap.m.StandardListItem({
                                title: "{custid}",
                                description: "{custnm}"
                            })
                        },
                        confirm: (oEvent) => {
                            var oSelected = oEvent.getParameter("selectedItem");
                            if (oSelected) {
                                this.byId("inputCustid").setValue(oSelected.getTitle());
                            }
                            oSelectDialog.destroy();
                        },
                        cancel: () => { oSelectDialog.destroy(); },
                        search: (oEvent) => {
                            var sVal = oEvent.getParameter("value").toLowerCase();
                            var oFilter = new Filter([
                                new Filter("custid", FilterOperator.Contains, sVal),
                                new Filter("custnm", FilterOperator.Contains, sVal)
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
            this.byId("inputOrdymFrom").setValue("");
            this.byId("inputOrdymTo").setValue("");
            this.byId("inputCustid").setValue("");
            this.byId("selectOrdsts").setSelectedKey("");

            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/orderItems", []);
            oViewModel.setProperty("/orderCount", 0);
            oViewModel.setProperty("/chartData", []);
            oViewModel.setProperty("/kpiTotamt", 0);
            oViewModel.setProperty("/kpiOrdCnt", 0);
            oViewModel.setProperty("/kpiApvCnt", 0);
            oViewModel.setProperty("/compareMode", false);
            oViewModel.setProperty("/compareVisible", false);
            oViewModel.setProperty("/kpiGrowth", 0);
            oViewModel.setProperty("/kpiGrowthColor", "Neutral");
        }
    });
});