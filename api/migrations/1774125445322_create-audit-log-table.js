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
    pgm.createType('entity_type_enum', [
        'organizations', 
        'departments', 
        'positions', 
        'employees',
        'files',
        'addresses',
        'passports',
        'users', 
        'hr_operations'
    ]);

    pgm.createTable('audit_log', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()')
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: '"users"',
            onDelete: 'RESTRICT'
        },
        entity_id: {
            type: 'uuid',
            notNull: true
        },
        entity_type: {
            type: 'entity_type_enum',
            notNull: true
        },
        changed_fields: {
            type: 'jsonb',
            notNull: true
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    });
    pgm.createIndex('audit_log', 'user_id');
    pgm.createIndex('audit_log', ['entity_id', 'entity_type']);

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('audit_log');
    pgm.dropType('entity_type_enum');
};
