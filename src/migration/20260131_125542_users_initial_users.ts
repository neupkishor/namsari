import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('users');

    table.addColumn('id').type('integer').isPrimary().autoIncrement();
    table.addColumn('username').type('string').isUnique().notNull();
    table.addColumn('name').type('string').notNull();
    table.addColumn('contact_number').type('string').notNull();
    table.addColumn('account_type').type('enum').values(['agency', 'agent', 'owner']).notNull();

    console.log('Migrating up: users table defined.');
}

export async function down() {
    console.log('Migrating down: users');
}