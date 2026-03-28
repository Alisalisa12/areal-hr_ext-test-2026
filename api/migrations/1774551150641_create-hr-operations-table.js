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
  pgm.createType('hr_operation_type_enum', [
    'hire',
    'transfer',
    'salary_change',
    'fire',
  ]);

  pgm.createTable('hr_operations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    emp_id: {
      type: 'uuid',
      notNull: true,
      references: '"employees"',
      onDelete: 'RESTRICT',
    },
    dept_id: {
      type: 'uuid',
      notNull: true,
      references: '"departments"',
      onDelete: 'RESTRICT',
    },
    pos_id: {
      type: 'uuid',
      notNull: true,
      references: '"positions"',
      onDelete: 'RESTRICT',
    },

    created_by: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'RESTRICT',
    },
    type: {
      type: 'hr_operation_type_enum',
      notNull: true,
    },
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

  pgm.createIndex('hr_operations', 'emp_id');
  pgm.createIndex('hr_operations', 'dept_id');
  pgm.createIndex('hr_operations', 'pos_id');
  pgm.createIndex('hr_operations', 'created_by');
  pgm.createIndex('hr_operations', 'type');
  pgm.createIndex('hr_operations', 'deleted_at');

  pgm.sql(`
        CREATE TRIGGER update_hr_operations_updated_at
        BEFORE UPDATE ON hr_operations
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
  pgm.sql(
    'DROP TRIGGER IF EXISTS update_hr_operations_updated_at ON hr_operations;',
  );
  pgm.dropIndex('hr_operations', 'type');
  pgm.dropIndex('hr_operations', 'created_by');
  pgm.dropIndex('hr_operations', 'pos_id');
  pgm.dropIndex('hr_operations', 'dept_id');
  pgm.dropIndex('hr_operations', 'emp_id');
  pgm.dropIndex('hr_operations', 'deleted_at');
  pgm.dropTable('hr_operations');
  pgm.dropType('hr_operation_type_enum');
};
