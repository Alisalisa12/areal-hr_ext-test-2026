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
    pgm.sql(`
        INSERT INTO "roles" (id, name, comment)
        VALUES 
          ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'Администратор системы'),
          ('b11ebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'manager', 'Менеджер')
      `);
      pgm.sql(`
        INSERT INTO "users" (role_id, employee_id, login, password_hash)
        SELECT 
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          id,
          'admin',
          '$2b$10$Eixza//nImM/i9S60dyZgeFycaBWuaDZNoVKXWVoK6.at9.8.v.6C' -- Пароль: admin123
        FROM "employees"
        LIMIT 1
      `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`DELETE FROM "users" WHERE login = 'admin';`);
    pgm.sql(`
        DELETE FROM "roles" 
        WHERE name IN ('admin', 'manager')
        AND id NOT IN (SELECT role_id FROM users);
      `);
};
