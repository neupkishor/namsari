import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('properties');

    table.addColumn('created_on').type('string');

    console.log('Migrating up: added created_on to properties.');
}

export async function down() {
    console.log('Migrating down: properites');
}
