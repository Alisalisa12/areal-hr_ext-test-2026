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
    pgm.createTable('passports', {
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
        series: { type: 'text', notNull: true },
        number: { type: 'text', notNull: true },
        issue_date: { type: 'date', notNull: true },
        issuer_code: { type: 'text', notNull: true },
        issued_by: { type: 'text', notNull: true },
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

    pgm.createIndex('passports', 'employee_id', {
        unique: true,
        where: 'deleted_at IS NULL',
        name: 'unique_active_employee_passport'
    });

    pgm.sql(`
        CREATE TRIGGER update_passports_updated_at
        BEFORE UPDATE ON passports
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
    pgm.sql('DROP TRIGGER IF EXISTS update_passports_updated_at ON passports;');
    pgm.dropTable('passports');
};
