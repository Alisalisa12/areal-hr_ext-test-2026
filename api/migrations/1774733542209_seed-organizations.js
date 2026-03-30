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
    INSERT INTO organizations (name, comment)
    VALUES
      ('ТехноСфера', 'Разработка корпоративного ПО'),
      ('РусЛогистик', 'Логистика и управление цепочками поставок'),
      ('СтройИнвест', 'Строительство и управление недвижимостью'),
      ('ПромЭнерго', 'Энергетический сектор, проектный офис'),
      ('ФинансГрупп', 'Финансовые услуги и аудит'),
      ('ДатаЛаб', 'Аналитика и обработка данных'),
      ('СетьТелеком', 'Телекоммуникации и сетевая инфраструктура'),
      ('АльфаКонсалт', 'Консалтинг и системная интеграция');
  `);

  pgm.sql(`
    INSERT INTO departments (organization_id, name, comment)
    VALUES
      ((SELECT id FROM organizations WHERE name = 'ТехноСфера'), 'Отдел разработки', 'Frontend, Backend и мобильные команды'),
      ((SELECT id FROM organizations WHERE name = 'ТехноСфера'), 'Отдел тестирования', 'Контроль качества и автотесты'),
      ((SELECT id FROM organizations WHERE name = 'ТехноСфера'), 'IT-инфраструктура', 'Сети, серверы, DevOps'),
      ((SELECT id FROM organizations WHERE name = 'РусЛогистик'), 'Отдел логистики', 'Планирование и диспетчеризация'),
      ((SELECT id FROM organizations WHERE name = 'РусЛогистик'), 'Отдел кадров', 'Найм и адаптация персонала'),
      ((SELECT id FROM organizations WHERE name = 'СтройИнвест'), 'Отдел проектирования', 'Архитектура и проектная документация'),
      ((SELECT id FROM organizations WHERE name = 'СтройИнвест'), 'Юридический отдел', 'Правовое сопровождение сделок'),
      ((SELECT id FROM organizations WHERE name = 'ФинансГрупп'), 'Бухгалтерия', 'Расчет и отчетность'),
      ((SELECT id FROM organizations WHERE name = 'ФинансГрупп'), 'Финансовый департамент', 'Управление активами'),
      ((SELECT id FROM organizations WHERE name = 'ДатаЛаб'), 'Отдел аналитики', 'Анализ и визуализация данных'),
      ((SELECT id FROM organizations WHERE name = 'СетьТелеком'), 'Техническая поддержка', 'Первая и вторая линия поддержки'),
      ((SELECT id FROM organizations WHERE name = 'АльфаКонсалт'), 'Департамент консалтинга', 'Бизнес-анализ и внедрение');

    INSERT INTO departments (organization_id, parent_id, name, comment)
    VALUES
      (
        (SELECT id FROM organizations WHERE name = 'ТехноСфера'),
        (SELECT id FROM departments WHERE name = 'Отдел разработки' AND organization_id = (SELECT id FROM organizations WHERE name = 'ТехноСфера')),
        'Группа backend-разработки',
        'Серверная логика и API'
      ),
      (
        (SELECT id FROM organizations WHERE name = 'ТехноСфера'),
        (SELECT id FROM departments WHERE name = 'Отдел разработки' AND organization_id = (SELECT id FROM organizations WHERE name = 'ТехноСфера')),
        'Группа frontend-разработки',
        'Интерфейсы и клиентская часть'
      ),
      (
        (SELECT id FROM organizations WHERE name = 'ФинансГрупп'),
        (SELECT id FROM departments WHERE name = 'Бухгалтерия' AND organization_id = (SELECT id FROM organizations WHERE name = 'ФинансГрупп')),
        'Сектор расчета зарплаты',
        'Расчет и выплата заработной платы'
      );
  `);
  pgm.sql(`
    INSERT INTO positions (name, comment)
    VALUES
      ('Генеральный директор', 'Руководство компанией'),
      ('Финансовый директор', 'Управление финансами'),
      ('Технический директор', 'Руководство IT-инфраструктурой'),
      ('Руководитель отдела разработки', 'Управление командой разработчиков'),
      ('Старший разработчик', 'Разработка и архитектура ПО'),
      ('Разработчик', 'Разработка программного обеспечения'),
      ('Системный администратор', 'Поддержка инфраструктуры'),
      ('Руководитель отдела кадров', 'Управление HR-процессами'),
      ('Специалист по подбору персонала', 'Найм и адаптация сотрудников'),
      ('Главный бухгалтер', 'Ведение бухгалтерского учета'),
      ('Бухгалтер', 'Расчет заработной платы и отчетность'),
      ('Аналитик данных', 'Анализ и визуализация данных'),
      ('Менеджер проекта', 'Управление проектами и сроками'),
      ('Специалист технической поддержки', 'Первая линия поддержки пользователей'),
      ('Юрисконсульт', 'Правовое сопровождение деятельности');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`DELETE FROM departments;`);

  pgm.sql(`
    DELETE FROM organizations
    WHERE name IN (
      'ТехноСфера', 'РусЛогистик', 'СтройИнвест', 'ПромЭнерго',
      'ФинансГрупп', 'ДатаЛаб', 'СетьТелеком', 'АльфаКонсалт'
    );
  `);

  pgm.sql(`
    DELETE FROM positions
    WHERE name IN (
      'Генеральный директор', 'Финансовый директор', 'Технический директор',
      'Руководитель отдела разработки', 'Старший разработчик', 'Разработчик',
      'Системный администратор', 'Руководитель отдела кадров',
      'Специалист по подбору персонала', 'Главный бухгалтер', 'Бухгалтер',
      'Аналитик данных', 'Менеджер проекта',
      'Специалист технической поддержки', 'Юрисконсульт'
    );
  `);
};
