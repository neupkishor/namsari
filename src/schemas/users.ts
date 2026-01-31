export const users = {
    fields: [
        { name: 'id', type: 'integer', isPrimary: true, autoIncrement: true },
        { name: 'username', type: 'string', notNull: true, isUnique: true },
        { name: 'name', type: 'string', notNull: true },
        { name: 'contact_number', type: 'string', notNull: true },
        { name: 'account_type', type: 'enum', notNull: true }
    ],
    insertableFields: ['username', 'name', 'contact_number', 'account_type'],
    updatableFields: ['username', 'name', 'contact_number', 'account_type'],
    massUpdateable: false,
    massDeletable: false,
    usesConnection: 'default'
};
