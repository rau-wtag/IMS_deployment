namespace my.inventory;

entity Products {
    key ID : UUID;
    name : String;
    description: String;
    unit_type: String;
    unit_price: Integer;
    warranty: Integer;
    stock: Integer;
}