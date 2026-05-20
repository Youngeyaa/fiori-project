

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

