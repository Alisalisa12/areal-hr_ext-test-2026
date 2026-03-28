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
  pgm.createTable('salary_changes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    operation_id: {
      type: 'uuid',
      notNull: true,
      references: '"hr_operations"',
      onDelete: 'RESTRICT',
    },
    old_salary: {
      type: 'numeric(15, 2)',
      default: 0,
    },
    new_salary: {
      type: 'numeric(15, 2)',
      notNull: true,
      default: 0,
    },
    changed_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    reason: {
      type: 'text',
      notNull: true,
    },
  });

  pgm.createIndex('salary_changes', 'operation_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex('salary_changes', 'operation_id');
  pgm.dropTable('salary_changes');
};
