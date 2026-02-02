using my.inventory as my from '../db/schema';

service CatalogService @(requires:'authenticated-user') {
    entity Products as projection on my.Products;
    annotate Products with @(restrict: [
        {
            grant: ['READ', 'WRITE'],
            to   : 'Write'
        },
        {
            grant: ['READ'],
            to   : 'Read'
        }
    ]);
}