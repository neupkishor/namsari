export const property_images = {
    fields: [
        { name: 'id', type: 'integer', isPrimary: true, autoIncrement: true },
        { name: 'property_id', type: 'integer', notNull: true },
        { name: 'url', type: 'string', notNull: true },
        { name: 'type', type: 'string', defaultValue: "image" },
        { name: 'caption', type: 'string' },
        { name: 'created_at', type: 'string' }
    ],
    insertableFields: ['property_id', 'url', 'type', 'caption', 'created_at'],
    updatableFields: ['property_id', 'url', 'type', 'caption', 'created_at'],
    massUpdateable: false,
    massDeletable: false,
    usesConnection: 'default'
};
