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
  pgm.createTable('files', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    employee_id: {
      type: 'uuid',
      notNull: true,
      references: '"employees"',
      onDelete: 'RESTRICT',
    },
    category_id: {
      type: 'uuid',
      notNull: true,
      references: '"file_categories"',
      onDelete: 'RESTRICT',
    },
    name: { type: 'text', notNull: true },
    storage_path: { type: 'text', notNull: true },
    mime_type: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    deleted_at: { type: 'timestamptz' },
  });

  pgm.createIndex('files', 'storage_path', {
    unique: true,
    name: 'unique_storage_path',
  });

  pgm.createIndex('files', 'employee_id');
  pgm.createIndex('files', 'category_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex('files', 'category_id');
  pgm.dropIndex('files', 'employee_id');
  pgm.dropIndex('files', [], { name: 'unique_storage_path' });
  pgm.dropTable('files');
};
