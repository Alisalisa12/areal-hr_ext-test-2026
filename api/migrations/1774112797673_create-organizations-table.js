/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('organizations', {
        id: {
            type: 'uuid', 
            primaryKey: true, 
            default: pgm.func('gen_random_uuid()')
        },
        name: { type: 'text', notNull: true },
        comment: { type: 'text' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        deleted_at: { type: 'timestamptz' },
    });

    pgm.createIndex('organizations', 'name', {
        unique: true,
        where: 'deleted_at IS NULL',
        name: 'unique_active_organization_name'
    });

    pgm.sql(`
        CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON organizations
        FOR EACH ROW
        EXECUTE PROCEDURE update_trig();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql('DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;');
    pgm.dropIndex('organizations', [], { name: 'unique_active_organization_name' });
    pgm.dropTable('organizations');
};
