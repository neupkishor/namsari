export const properties = {
    fields: {
        id: ['integer', 'auto-increment'],
        author: ['string'],
        title: ['string'],
        price: ['string'],
        location: ['string'],
        specs: ['string'],
        main_category: ['string'], // House, Land, Apartment, Building
        commercial_sub_category: ['string'],
        property_types: ['string'], // stored as JSON string for multi-select
        purposes: ['string'], // stored as JSON string for multi-select
        images: ['string'], // stored as JSON array string
        likes: ['string', 'default.value', '0'],
        timestamp: ['string'],
        created_on: ['string'],
        listed_by: ['integer', 'foreignKey.users.id']
    },
    insertableFields: [
        'author', 'title', 'price', 'location', 'specs',
        'main_category', 'commercial_sub_category',
        'property_types', 'purposes', 'images', 'likes', 'timestamp',
        'created_on', 'listed_by'
    ],
    updatableFields: [
        'title', 'price', 'location', 'specs',
        'main_category', 'commercial_sub_category',
        'property_types', 'purposes', 'images', 'likes',
        'listed_by'
    ],
    massUpdateable: true,
    massDeletable: true,
    usesConnection: 'namsari'
};