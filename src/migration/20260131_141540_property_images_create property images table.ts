import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('property_images');

    //Define the connection.
    table.useConnection('default');

    // Add columns
    table.addColumn('id').type('integer').isPrimary().autoIncrement();
    table.addColumn('property_id').type('integer').notNull(); // Foreign key to properties
    table.addColumn('url').type('string').notNull();
    table.addColumn('type').type('string').default('image');
    table.addColumn('caption').type('string');
    table.addColumn('created_at').type('string');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating up: property_images table created');
}

export async function down() {
    const table = new TableMigrator('property_images');

    // Drop the table
    table.dropTable();

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating down: property_images');
}