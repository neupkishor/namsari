import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    // Create a new table migrator
    const table = new TableMigrator('properties');

    // Add a new column
    table.addColumn('created_on').type('string');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating up: added created_on to properties.');
}

export async function down() {
    // Create a new table migrator
    const table = new TableMigrator('properties');

    // Drop the column
    table.dropColumn('created_on');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating down: properites');
}
