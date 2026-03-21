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
    pgm.createTable('addresses', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        employee_id: {
            type: 'uuid',
            notNull: true,
            references: '"employees"',
            onDelete: 'CASCADE'
        },
        region: { type: 'text', notNull: true },
        city: { type: 'text', notNull: true },
        street: { type: 'text', notNull: true },
        house: { type: 'text', notNull: true },
        block: { type: 'text' }, 
        flat: { type: 'text' },  
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

    pgm.createIndex('addresses', 'employee_id');

    pgm.sql(`
        CREATE TRIGGER update_addresses_updated_at
        BEFORE UPDATE ON addresses
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
    pgm.sql('DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;');
    pgm.dropTable('addresses');
};
