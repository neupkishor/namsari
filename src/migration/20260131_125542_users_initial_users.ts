import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    // Create a new table migrator
    const table = new TableMigrator('users');

    // Add columns
    table.addColumn('id').type('integer').isPrimary().autoIncrement();
    table.addColumn('username').type('string').isUnique().notNull();
    table.addColumn('name').type('string').notNull();
    table.addColumn('contact_number').type('string').notNull();
    table.addColumn('account_type').type('enum').values(['agency', 'agent', 'owner']).notNull()

    // Execute the migration
    await table.exec();

    // Publish the message
    console.log('Migrating up: users table defined.');
}

export async function down() {
    const table = new TableMigrator('users')

    // Drop the table
    table.dropTable();

    // Execute the command
    await table.exec();

    // Publish the message
    console.log('Migrating down: users');
}