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
  pgm.createTable('file_categories', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
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

  pgm.createIndex('file_categories', 'name', {
    unique: true,
    name: 'unique_category_name',
  });

  pgm.sql(`
            CREATE TRIGGER update_file_categories_updated_at
            BEFORE UPDATE ON file_categories
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
    'DROP TRIGGER IF EXISTS update_file_categories_updated_at ON file_categories;',
  );
  pgm.dropIndex('file_categories', [], {
    name: 'unique_category_name',
  });
  pgm.dropTable('file_categories');
};
