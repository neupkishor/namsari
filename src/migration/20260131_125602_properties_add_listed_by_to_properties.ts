import { TableMigrator } from '@neupgroup/mapper';

export async function up() {
    const table = new TableMigrator('properties');

    table.addColumn('listed_by').type('integer').foreignKey('users', 'id');

    console.log('Migrating up: added listed_by to properties.');
}

export async function down() {
    console.log('Migrating down: properties');
}