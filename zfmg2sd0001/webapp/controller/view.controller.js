// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast"
// ], (Controller, MessageBox, MessageToast) => {
//     "use strict";

//     return Controller.extend("code.zfmg2sd0001.controller.view", {
//         onInit() {
//         },
//     onRefresh: function () {
//             var oTable = this.byId("salesOrderTable");
//             oTable.getBinding("items").refresh();
//             MessageToast.show("데이터가 새로고침되었습니다.");
//         },

//         /**
//          * [오더 승인] 버튼 클릭 이벤트
//          */
//         onApprove: function () {
//             var oTable = this.byId("salesOrderTable");
//             var aSelectedItems = oTable.getSelectedItems();

//             if (aSelectedItems.length === 0) {
//                 MessageBox.warning("승인할 오더를 한 건 이상 선택해주세요.");
//                 return;
//             }

//             var oModel = this.getView().getModel();
//             var iTotal = aSelectedItems.length;
//             var iSuccessCount = 0;
//             var iFailCount = 0;

//             MessageBox.confirm(iTotal + "건의 오더를 승인하시겠습니까?", {
//                 actions: [MessageBox.Action.YES, MessageBox.Action.NO],
//                 onClose: function (sAction) {
//                     if (sAction === MessageBox.Action.YES) {
//                         sap.ui.core.BusyIndicator.show(0); // 화면 잠금 (로딩바)

//                         aSelectedItems.forEach(function (oItem) {
//                             var oContext = oItem.getBindingContext();
//                             var sPath = oContext.getPath(); // 예: /SalesOrderHeaderSet('SO26000004')
//                             var sOrdno = oContext.getProperty("Ordno");

//                             // 백엔드 UPDATE_ENTITY(PUT)로 보낼 데이터 세팅
//                             var oUpdateData = {
//                                 "Ordno": sOrdno,
//                                 "Ordsts": "2" // 승인 상태 코드
//                             };

//                             // 백엔드로 PUT 요청 송신! (우리가 GW_CLIENT에서 테스트했던 바로 그 로직)
//                             oModel.update(sPath, oUpdateData, {
//                                 success: function () {
//                                     iSuccessCount++;
//                                     this._checkBatchFinished(iTotal, iSuccessCount, iFailCount);
//                                 }.bind(this),
//                                 error: function (oError) {
//                                     iFailCount++;
//                                     this._checkBatchFinished(iTotal, iSuccessCount, iFailCount);
//                                 }.bind(this)
//                             });
//                         }.bind(this));
//                     }
//                 }.bind(this)
//             });
//         },

//         /**
//          * 모든 비동기 승인 요청이 끝났는지 확인하고 마감 처리하는 내부 함수
//          */
//         _checkBatchFinished: function (iTotal, iSuccess, iFail) {
//             if (iSuccess + iFail === iTotal) {
//                 sap.ui.core.BusyIndicator.hide(); // 로딩 해제
//                 this.byId("salesOrderTable").removeSelections(); // 체크박스 해제

//                 if (iFail === 0) {
//                     MessageBox.success(iSuccess + "건의 오더가 성공적으로 승인되었습니다.", {
//                         onClose: function () {
//                             this.onRefresh(); // 테이블 새로고침
//                         }.bind(this)
//                     });
//                 } else {
//                     MessageBox.warning("일부 오더 승인 중 오류가 발생했습니다.\n성공: " + iSuccess + "건, 실패: " + iFail + "건");
//                     this.onRefresh();
//                 }
//             }
//         }
//     });
// });


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("code.zfmg2sd0001.controller.view", {
        
        onInit() {
            // 초기화 로직 (필요시)
        },

        /**
         * [오더 승인] 버튼 클릭 이벤트
         */
        onApprove: function () {
            var oTable = this.byId("headerTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("승인할 오더를 선택해주세요.");
                return;
            }

            var oModel = this.getView().getModel(); // manifest.json의 기본 모델
            var iTotal = aSelectedItems.length;
            var iSuccess = 0;
            var iFail = 0;

            MessageBox.confirm(iTotal + "건의 오더를 승인하시겠습니까?", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        sap.ui.core.BusyIndicator.show(0);
                        
                        aSelectedItems.forEach((oItem) => {
                            var oContext = oItem.getBindingContext();
                            var sPath = oContext.getPath();
                            var oData = oContext.getObject();

                            // 백엔드 UPDATE_ENTITY(PUT) 호출
                            oModel.update(sPath, {
                                "Ordno": oData.Ordno,
                                "Ordseq": oData.Ordseq,
                                "Ordsts": "2" 
                            }, {
                                success: () => {
                                    iSuccess++;
                                    this._onProcessFinished(iTotal, iSuccess, iFail);
                                },
                                error: () => {
                                    iFail++;
                                    this._onProcessFinished(iTotal, iSuccess, iFail);
                                }
                            });
                        });
                    }
                }
            });
        },

        /**
         * 처리 완료 후 테이블 갱신
         */
        _onProcessFinished: function (iTotal, iSuccess, iFail) {
            if (iSuccess + iFail === iTotal) {
                sap.ui.core.BusyIndicator.hide();
                this.byId("headerTable").removeSelections();
                
                if (iFail === 0) {
                    MessageToast.show(iSuccess + "건 승인 완료");
                    this.byId("headerTable").getBinding("items").refresh();
                } else {
                    MessageBox.error("승인 중 오류 발생 (성공: " + iSuccess + ", 실패: " + iFail + ")");
                }
            }
        },

        /**
         * [새로고침] 버튼 클릭
         */
        onRefresh: function () {
            this.byId("headerTable").getBinding("items").refresh();
        }
    });
});

