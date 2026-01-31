import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('properties');

    // Add column
    table.addColumn('created_on').type('string');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating up: Added created_on to properties');
}

export async function down() {
    const table = new TableMigrator('properties');

    // Drop column
    table.dropColumn('created_on');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating down: Reverting created_on from properties');
}