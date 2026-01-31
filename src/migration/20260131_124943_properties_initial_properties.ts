import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('properties');

    table.addColumn('id').type('integer').isPrimary().autoIncrement();
    table.addColumn('author').type('string').notNull();
    table.addColumn('title').type('string').notNull();
    table.addColumn('price').type('string').notNull();
    table.addColumn('location').type('string').notNull();
    table.addColumn('specs').type('string').notNull();

    // Hierarchical Categorization Model
    // Main Categories: House, Land, Apartment, Building
    table.addColumn('main_category').type('string').notNull();

    // Commercial Sub-Category: 
    // Land -> Agriculture/Farm Land, Factory Land
    // Building -> Office Space, Rental Building, Complex, Hospital, Hotel
    table.addColumn('commercial_sub_category').type('string');

    // Multi-select Property Type: Residential, Commercial, Semi-Commercial
    table.addColumn('property_types').type('string');

    // Multi-select Purpose: Available for Sale, Available for Rent
    table.addColumn('purposes').type('string');

    // Media and Metrics
    table.addColumn('images').type('text'); // Stored as JSON array
    table.addColumn('likes').type('string').default('0');
    table.addColumn('timestamp').type('string');

    console.log('Migrating up: properties table defined with advanced categorization.');
}

export async function down() {
    console.log('Migrating down: properties');
}