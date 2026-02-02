const cds = require('@sap/cds');

// The class name must match the service name in your .cds file

module.exports = cds.service.impl(async function () {
    const { Products } = this.entities; 

   this.before('*', (req) => {
        console.log('--- Auth Debug ---');
        console.log('User:', req.user.id);
        console.log('Scopes:', req.user);
        return; 
    });
});