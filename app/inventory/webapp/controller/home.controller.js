sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageBox,Fragment, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("inventory.controller.home", {
        onInit() {
            console.log("We're HOMEEEEEE");
        },
        onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},
        onSubmit: function(){
            var product_name = this.getView().byId("name").getValue();
            var unit_type = this.getView().byId("unit_type").getValue();
            var unit_price = this.getView().byId("unit_price").getValue();
            var warranty = this.getView().byId("warranty").getValue();
            var stock = this.getView().byId("stock").getValue();
            var oModel = this.getView().getModel();

            var oContext = oModel.bindList("/Products").create({
                "name": product_name,
                "unit_type" : unit_type,
                "unit_price": unit_price,
                "warranty": warranty,
                "stock": stock
            });
            console.log(oContext);

            oContext.created().then(() => {
                MessageBox.success("Product added successfully")
                this.getView().byId("name").setValue(null);
                this.getView().byId("unit_type").setValue(null);
                this.getView().byId("unit_price").setValue(null);
                this.getView().byId("warranty").setValue(null);
                this.getView().byId("stock").setValue(null);

                oModel.refresh();
            }).catch((err) => {
                MessageBox.error("Error adding new product");
                console.error("Error adding Item : " + err)
            });
            
             
        },
        onAddProductPressed : function() {
            this.hideAllPanels();
            var oPanel = this.byId("addProductPanel");
            oPanel.setVisible(true);
        },
        onViewProductsPressed : function() {
            console.log("View Products pressed 1");
            this.hideAllPanels();
            var oPanel = this.byId("viewProductsPanel");
            console.log("View Products pressed 2");
            oPanel.setVisible(true);
        },
        onEditProductsPressed : function() {
            this.hideAllPanels();
            var oPanel = this.byId("editProductPanel");
            oPanel.setVisible(true);
        },
        hideAllPanels() {
            this.byId("addProductPanel").setVisible(false);
            this.byId("viewProductsPanel").setVisible(false);
            this.byId("editProductPanel").setVisible(false);
        },
        onActionPressed: function(oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            this._oSelectedContext = oContext;
            
            if(!this._oActionSheet) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "inventory.view.ActionSheet",
                    controller: this
                }).then(function(oActionSheet){
                    this._oActionSheet = oActionSheet;
                    this.getView().addDependent(this._oActionSheet);
                    this._oActionSheet.openBy(oButton);
                }.bind(this));
            }
            else {
                this._oActionSheet.openBy(oButton)
            }

        },
        onDeletePress: function() {
            var oContext = this._oSelectedContext;
            var sProductID = oContext.getProperty("ID");
            MessageBox.confirm("Are you sure you want to delete" + sProductID + "?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function(oAction){
                    if(oAction === MessageBox.Action.YES){
                        oContext.delete("$direct").then(function(){
                            MessageBox.success(sProductID + "deleted successfully");
                        }).catch(function(oError) {
                            MessageBox.error("Error deleting" + sProductID+": " + oError)
                        })
                    }
                }
            })
        },
        onEditPress : function() {
            var oData = this._oSelectedContext.getObject();
            MessageToast.show("Edit action for product: "+ oData.ID)
            this.onEditProductsPressed();
            var product_model = this.getOwnerComponent().getModel();
            let aFilters = [
                new Filter("ID", FilterOperator.EQ, oData.ID)
            ];
            let oBinding = product_model.bindList("/Products");
            oBinding.filter(aFilters);

            oBinding.requestContexts().then((aContexts) => {
                if(aContexts.length > 0) {
                    aContexts.forEach((oContext) => {
                        let oUser = oContext.getObject();
                        this.getView().byId("productID").setValue(oUser.ID);
                        this.getView().byId("editName").setValue(oUser.name);
                        this.getView().byId("editUnit_type").setValue(oUser.unit_type);
                        this.getView().byId("editUnit_price").setValue(oUser.unit_price);
                        this.getView().byId("editWarranty").setValue(oUser.warranty);
                        this.getView().byId("editStock").setValue(oUser.stock);

                    });
                }
                else {
                    MessageBox.error("No book found with this ID.")
                }
            }).catch((oError) => {
                MessageBox.error("Error retrieving product details: " + oError)
            });

        },
        updateProduct : function() {
            var id = this.getView().byId("productID").getValue();
            var name = this.getView().byId("editName").getValue();
            var unit_type = this.getView().byId("editUnit_type").getValue();
            var unit_price = this.getView().byId("editUnit_price").getValue();
            var warranty = this.getView().byId("editWarranty").getValue();
            var stock = this.getView().byId("editStock").getValue();

            var update_model = this.getView().getModel();
            var sPath = "Products('"+id+"')";
            var oView = this.getView();
            function _resetBusy() {
                oView.setBusy(false);
            }
            oView.setBusy(true);
            var oContext = this._oSelectedContext;
            oContext.setProperty("name", name);
            oContext.setProperty("unit_type", unit_type);
            oContext.setProperty("unit_price", unit_price);
            oContext.setProperty("warranty", warranty);
            oContext.setProperty("stock", stock);

            update_model.submitBatch("auto").then(() => {
                _resetBusy();
                MessageBox.success("Product updated successfully");
            }).catch((err) => {
                MessageBox.error("An error occurred while performing the update: " + err)
            })

        }

    });
});