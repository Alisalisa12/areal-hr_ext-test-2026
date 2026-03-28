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
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    role_id: {
      type: 'uuid',
      notNull: true,
      references: '"roles"',
      onDelete: 'RESTRICT',
    },
    employee_id: {
      type: 'uuid',
      notNull: true,
      references: '"employees"',
      onDelete: 'RESTRICT',
    },
    login: { type: 'text', notNull: true },
    password_hash: { type: 'text', notNull: true },
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

  pgm.createIndex('users', 'employee_id', {
    unique: true,
    name: 'unique_employee_user',
  });

  pgm.createIndex('users', 'login', {
    unique: true,
    name: 'unique_user_login',
  });

  pgm.createIndex('users', 'role_id');

  pgm.sql(`
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
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
  pgm.sql('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
  pgm.dropIndex('users', 'role_id');
  pgm.dropIndex('users', [], { name: 'unique_employee_user' });
  pgm.dropIndex('users', [], { name: 'unique_user_login' });
  pgm.dropTable('users');
};
