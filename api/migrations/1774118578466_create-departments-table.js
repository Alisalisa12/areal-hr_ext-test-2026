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
    pgm.createTable('departments', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        organization_id: {
            type: 'uuid',
            notNull: true,
            references: '"organizations"',
            onDelete: 'CASCADE'
        },
        parent_id: {
            type: 'uuid',
            references: '"departments"',
            onDelete: 'SET NULL'
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

    pgm.createIndex('departments', ['organization_id', 'name'], {
        unique: true,
        where: 'deleted_at IS NULL',
        name: 'unique_active_department_name'
    });

    pgm.createIndex('departments', 'parent_id');

    pgm.sql(`
        CREATE TRIGGER update_departments_updated_at
        BEFORE UPDATE ON departments
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
    pgm.sql('DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;');
    pgm.dropIndex('departments', [], { name: 'unique_active_department_name' });
    pgm.dropTable('departments');
};
