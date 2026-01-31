import { Mapper } from '@neupgroup/mapper';
import { properties } from './schemas/properties';
import { users } from './schemas/users';
import { config as namsariConfig } from './connection/namsari';

let initialized = false;

export function initMapper() {
    if (initialized) return Mapper;

    // 1. Setup Connection
    Mapper.makeConnection('namsari', 'sqlite', namsariConfig);

    // 2. Setup Schemas
    const propSchema = Mapper.schemas('properties');
    propSchema.fields = properties.fields;
    propSchema.insertableFields = properties.insertableFields;
    propSchema.updatableFields = properties.updatableFields;
    propSchema.massEditAllowed = properties.massUpdateable;
    propSchema.massDeleteAllowed = properties.massDeletable;

    const userSchema = Mapper.schemas('users');
    userSchema.fields = users.fields;
    userSchema.insertableFields = users.insertableFields;
    userSchema.updatableFields = users.updatableFields;
    userSchema.massEditAllowed = users.massUpdateable;
    userSchema.massDeleteAllowed = users.massDeletable;

    initialized = true;
    return Mapper;
}

export { Mapper };
