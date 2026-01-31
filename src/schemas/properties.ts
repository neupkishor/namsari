export const properties = {
    fields: [
        { name: 'id', type: 'integer', isPrimary: true, autoIncrement: true },
        { name: 'author', type: 'string', notNull: true },
        { name: 'title', type: 'string', notNull: true },
        { name: 'price', type: 'string', notNull: true },
        { name: 'location', type: 'string', notNull: true },
        { name: 'specs', type: 'string', notNull: true },
        { name: 'main_category', type: 'string', notNull: true },
        { name: 'commercial_sub_category', type: 'string' },
        { name: 'property_types', type: 'string' },
        { name: 'purposes', type: 'string' },
        { name: 'images', type: 'text' },
        { name: 'likes', type: 'string', defaultValue: "0" },
        { name: 'timestamp', type: 'string' }
    ],
    insertableFields: ['author', 'title', 'price', 'location', 'specs', 'main_category', 'commercial_sub_category', 'property_types', 'purposes', 'images', 'likes', 'timestamp'],
    updatableFields: ['author', 'title', 'price', 'location', 'specs', 'main_category', 'commercial_sub_category', 'property_types', 'purposes', 'images', 'likes', 'timestamp'],
    massUpdateable: false,
    massDeletable: false,
    usesConnection: 'default'
};
