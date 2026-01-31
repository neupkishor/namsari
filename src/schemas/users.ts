export const users = {
    fields: {
        id: ['integer', 'auto-increment'],
        username: ['string', 'unique'],
        name: ['string'],
        contact_number: ['string'],
        account_type: ['string', 'enum', ['agency', 'agent', 'owner']]
    },
    insertableFields: ['username', 'name', 'contact_number', 'account_type'],
    updatableFields: ['name', 'contact_number', 'account_type'],
    massUpdateable: false,
    massDeletable: false,
    usesConnection: 'namsari'
};