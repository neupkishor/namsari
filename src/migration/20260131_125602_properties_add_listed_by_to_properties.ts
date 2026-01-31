import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('properties');

    // Define the connection.
    table.useConnection('default');

    // Add a new column
    table.addColumn('listed_by').type('integer').foreignKey('users', 'id');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating up: added listed_by to properties.');
}

export async function down() {
    const table = new TableMigrator('properties');

    // Drop the column
    table.dropColumn('listed_by');

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating down: properties');
}