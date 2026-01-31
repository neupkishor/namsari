import Mapper, { createAdapter } from '@neupgroup/mapper';
import { properties } from './schemas/properties';
import { users } from './schemas/users';
import { config as namsariConfig } from './connection/namsari';

let initialized = false;

export function initMapper() {
    if (initialized) return Mapper;

    // 1. Setup Connection
    const connectionName = 'namsari';

    // Check if connection already exists to prevent errors during HMR
    const connections = Mapper.getConnections();
    if (!connections.get(connectionName)) {
        Mapper.connect(connectionName, 'sqlite', namsariConfig);

        // Use the generic createAdapter factory since createSQLiteAdapter 
        // is missing from the library's main index.js re-exports
        const adapter = createAdapter({
            type: 'sqlite',
            config: namsariConfig
        });
        connections.attachAdapter(connectionName, adapter);
    }

    // 2. Setup Schemas
    try {
        Mapper.schema('properties')
            .use({ connection: connectionName, collection: 'properties' })
            .setOptions({
                insertableFields: properties.insertableFields,
                updatableFields: properties.updatableFields,
                massEditAllowed: properties.massUpdateable,
                massDeleteAllowed: properties.massDeletable
            })
            .setStructure(properties.fields);
    } catch (e) {
        // Schema might already exist
    }

    try {
        Mapper.schema('users')
            .use({ connection: connectionName, collection: 'users' })
            .setOptions({
                insertableFields: users.insertableFields,
                updatableFields: users.updatableFields,
                massEditAllowed: users.massUpdateable,
                massDeleteAllowed: users.massDeletable
            })
            .setStructure(users.fields);
    } catch (e) {
        // Schema might already exist
    }

    initialized = true;
    return Mapper;
}

export { Mapper };
