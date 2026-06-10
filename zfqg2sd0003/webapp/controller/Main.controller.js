sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("code.zfqg2sd0003.controller.Main", {

        onInit: function () {
            var oViewModel = new JSONModel({
                orderItems: [],
                orderCount: 0,
                chartData: [],
                kpiTotamt: 0,
                kpiOrdCnt: 0,
                kpiApvCnt: 0
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        /**
         * 금액 천단위 콤마 포맷터
         */
        formatAmount: function (sVal) {
            if (!sVal) return "0";
            return parseInt(sVal).toLocaleString("ko-KR");
        },

        /**
         * 조회 버튼
         */
        onSearch: function () {
            var oModel = this.getView().getModel();
            var aFilters = [];

            var sFrom   = this.byId("inputOrdymFrom").getValue().trim();
            var sTo     = this.byId("inputOrdymTo").getValue().trim();
            var sCustid = this.byId("inputCustid").getValue().trim();
            var sOrdsts = this.byId("selectOrdsts").getSelectedKey();


            // 조회월 필터
            if (sFrom && sTo) {
                aFilters.push(new Filter("ordym", FilterOperator.BT, sFrom, sTo));
            } else if (sFrom) {
                var sYear = new Date().getFullYear().toString();
                aFilters.push(new Filter("ordym", FilterOperator.BT, sFrom, sYear + "12"));
            } else if (sTo) {
                var sYear = new Date().getFullYear().toString();
                aFilters.push(new Filter("ordym", FilterOperator.BT, sYear + "01", sTo));
            } else {
                var sYear = new Date().getFullYear().toString();
                aFilters.push(new Filter("ordym", FilterOperator.BT, sYear + "01", sYear + "12"));
            }

            if (sCustid) aFilters.push(new Filter("custid", FilterOperator.EQ, sCustid));
            if (sOrdsts) aFilters.push(new Filter("ordsts", FilterOperator.EQ, sOrdsts));

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
                    this._buildChartData(aResults);

                    // 차트 속성 설정
                    var oVizFrame = this.byId("vizChart");
                    oVizFrame.setVizProperties({
                        title: { text: "월별 매출 추이" },
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
                    MessageBox.error("데이터 조회 오류");
                }
            });
        },

        /**
         * KPI 집계
         */
        _buildKpiData: function (aResults) {
            var oViewModel = this.getView().getModel("viewModel");

            // 총매출
            var fTotal = aResults.reduce((acc, o) => acc + (parseFloat(o.totamt) || 0), 0);

            // 구독건수 (전체)
            var iOrdCnt = aResults.length;

            // 승인건수
            var iApvCnt = aResults.filter((o) => o.ordsts === "2").length;

            // var iManwon = Math.round(fTotal / 10000);
            // oViewModel.setProperty("/kpiTotamt", iManwon.toLocaleString("ko-KR"));

             oViewModel.setProperty("/kpiTotamt", Math.round(fTotal).toLocaleString("ko-KR"));
            oViewModel.setProperty("/kpiOrdCnt", iOrdCnt);
            oViewModel.setProperty("/kpiApvCnt", iApvCnt);
        },

        /**
         * 월별 매출 차트 집계
         */
        _buildChartData: function (aResults) {
            var oMap = {};
            aResults.forEach((o) => {
                var sKey = o.ordym || "기타";
                if (!oMap[sKey]) oMap[sKey] = 0;
                oMap[sKey] += parseFloat(o.totamt) || 0;
            });

            var aChartData = Object.keys(oMap).sort().map((k) => ({
                ordym: k,
                totamt: Math.round(oMap[k])
            }));

            this.getView().getModel("viewModel").setProperty("/chartData", aChartData);
        },

        /**
         * 고객ID 서치헬프
         */
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

        /**
         * 초기화 버튼
         */
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
        }
    });
});