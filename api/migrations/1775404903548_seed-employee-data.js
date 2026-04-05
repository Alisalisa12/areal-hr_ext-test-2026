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
    INSERT INTO file_categories (name, comment)
    VALUES
      ('Паспорт',                  'Скан или фото паспорта гражданина РФ'),
      ('СНИЛС',                    'Страховое свидетельство обязательного пенсионного страхования'),
      ('ИНН',                      'Свидетельство о постановке на учёт в налоговом органе'),
      ('Трудовая книжка',          'Скан трудовой книжки или вкладыша'),
      ('Диплом об образовании',    'Диплом о высшем или среднем профессиональном образовании'),
      ('Медицинская книжка',       'Личная медицинская книжка сотрудника'),
      ('Трудовой договор',         'Подписанный трудовой договор с сотрудником'),
      ('Приказ о приёме',          'Приказ о приёме на работу'),
      ('Приказ об увольнении',     'Приказ о прекращении трудового договора'),
      ('Согласие на обработку ПДн','Подписанное согласие на обработку персональных данных'),
      ('Военный билет',            'Военный билет или приписное свидетельство'),
      ('Сертификат / Удостоверение','Сертификат о прохождении курсов или профессиональное удостоверение');
  `);

  pgm.sql(`
    INSERT INTO employees (last_name, first_name, middle_name, birth_date)
    VALUES
      ('Иванов',    'Александр', 'Петрович',    '1985-03-15'),
      ('Петрова',   'Мария',     'Сергеевна',   '1990-07-22'),
      ('Сидоров',   'Дмитрий',   'Алексеевич',  '1978-11-08'),
      ('Козлова',   'Анна',      'Владимировна', '1995-02-14'),
      ('Новиков',   'Андрей',    'Игоревич',    '1982-09-30'),
      ('Морозова',  'Елена',     'Николаевна',  '1988-05-17'),
      ('Волков',    'Сергей',    'Михайлович',  '1975-12-01'),
      ('Соколова',  'Ольга',     'Андреевна',   '1992-04-25'),
      ('Лебедев',   'Максим',    'Юрьевич',     '1987-08-13'),
      ('Кузнецова', 'Наталья',   'Ивановна',    '1993-01-07'),
      ('Орлов',     'Виктор',    'Фёдорович',   '1980-06-19'),
      ('Захарова',  'Юлия',      'Олеговна',    '1997-10-03'),
      ('Смирнов',   'Павел',     'Геннадьевич', '1983-12-28'),
      ('Фёдорова',  'Ирина',     'Дмитриевна',  '1991-03-11'),
      ('Никитин',   'Роман',     'Васильевич',  '1979-09-05');
  `);

  pgm.sql(`
    INSERT INTO passports (employee_id, series, number, issue_date, issuer_code, issued_by)
    VALUES
      ((SELECT id FROM employees WHERE last_name = 'Иванов'    AND first_name = 'Александр' LIMIT 1), '4510', '123456', '2015-06-20', '770-001', 'УФМС России по г. Москве в районе Тверской'),
      ((SELECT id FROM employees WHERE last_name = 'Петрова'   AND first_name = 'Мария'     LIMIT 1), '7821', '654321', '2020-03-14', '782-002', 'УМВД России по Краснодарскому краю'),
      ((SELECT id FROM employees WHERE last_name = 'Сидоров'   AND first_name = 'Дмитрий'   LIMIT 1), '5403', '789012', '2018-11-05', '540-003', 'УМВД России по Новосибирской области'),
      ((SELECT id FROM employees WHERE last_name = 'Козлова'   AND first_name = 'Анна'      LIMIT 1), '6316', '345678', '2022-01-19', '631-004', 'УМВД России по Самарской области'),
      ((SELECT id FROM employees WHERE last_name = 'Новиков'   AND first_name = 'Андрей'    LIMIT 1), '4612', '901234', '2017-08-30', '461-005', 'УМВД России по Воронежской области'),
      ((SELECT id FROM employees WHERE last_name = 'Морозова'  AND first_name = 'Елена'     LIMIT 1), '5203', '567890', '2019-04-12', '520-006', 'УМВД России по Нижегородской области'),
      ((SELECT id FROM employees WHERE last_name = 'Волков'    AND first_name = 'Сергей'    LIMIT 1), '6602', '234567', '2010-12-01', '660-007', 'УМВД России по Тюменской области'),
      ((SELECT id FROM employees WHERE last_name = 'Соколова'  AND first_name = 'Ольга'     LIMIT 1), '7804', '890123', '2021-09-08', '780-008', 'УМВД России по Краснодарскому краю'),
      ((SELECT id FROM employees WHERE last_name = 'Лебедев'   AND first_name = 'Максим'    LIMIT 1), '4511', '456789', '2016-07-22', '770-009', 'УФМС России по г. Москве в районе Хамовники'),
      ((SELECT id FROM employees WHERE last_name = 'Кузнецова' AND first_name = 'Наталья'   LIMIT 1), '5406', '012345', '2023-02-15', '540-010', 'УМВД России по Новосибирской области'),
      ((SELECT id FROM employees WHERE last_name = 'Орлов'     AND first_name = 'Виктор'    LIMIT 1), '3901', '678901', '2013-05-10', '390-011', 'УМВД России по Калужской области'),
      ((SELECT id FROM employees WHERE last_name = 'Захарова'  AND first_name = 'Юлия'      LIMIT 1), '7801', '234098', '2022-10-28', '780-012', 'УМВД России по Краснодарскому краю'),
      ((SELECT id FROM employees WHERE last_name = 'Смирнов'   AND first_name = 'Павел'     LIMIT 1), '4709', '876543', '2014-03-03', '470-013', 'УМВД России по Омской области'),
      ((SELECT id FROM employees WHERE last_name = 'Фёдорова'  AND first_name = 'Ирина'     LIMIT 1), '6101', '321654', '2020-07-17', '610-014', 'УМВД России по Ростовской области'),
      ((SELECT id FROM employees WHERE last_name = 'Никитин'   AND first_name = 'Роман'     LIMIT 1), '5803', '109876', '2012-09-22', '580-015', 'УМВД России по Оренбургской области');
  `);

  pgm.sql(`
    INSERT INTO addresses (employee_id, region, city, street, house, block, flat)
    VALUES
      ((SELECT id FROM employees WHERE last_name = 'Иванов'    AND first_name = 'Александр' LIMIT 1), 'Москва',               'Москва',          'ул. Тверская',               '14',  NULL,  '32'),
      ((SELECT id FROM employees WHERE last_name = 'Петрова'   AND first_name = 'Мария'     LIMIT 1), 'Краснодарский край',   'Краснодар',       'ул. Красная',                '87',  'к. 2','15'),
      ((SELECT id FROM employees WHERE last_name = 'Сидоров'   AND first_name = 'Дмитрий'   LIMIT 1), 'Новосибирская область','Новосибирск',     'пр. Карла Маркса',           '3',   NULL,  '78'),
      ((SELECT id FROM employees WHERE last_name = 'Козлова'   AND first_name = 'Анна'      LIMIT 1), 'Самарская область',    'Самара',          'ул. Ленина',                 '22',  'к. 1','5'),
      ((SELECT id FROM employees WHERE last_name = 'Новиков'   AND first_name = 'Андрей'    LIMIT 1), 'Воронежская область',  'Воронеж',         'ул. Плехановская',           '55',  NULL,  '101'),
      ((SELECT id FROM employees WHERE last_name = 'Морозова'  AND first_name = 'Елена'     LIMIT 1), 'Нижегородская область','Нижний Новгород', 'ул. Большая Покровская',     '10',  NULL,  '12'),
      ((SELECT id FROM employees WHERE last_name = 'Волков'    AND first_name = 'Сергей'    LIMIT 1), 'Тюменская область',    'Тюмень',          'ул. Республики',             '43',  'к. 3','67'),
      ((SELECT id FROM employees WHERE last_name = 'Соколова'  AND first_name = 'Ольга'     LIMIT 1), 'Краснодарский край',   'Сочи',            'ул. Курортный проспект',     '120', NULL,  '8'),
      ((SELECT id FROM employees WHERE last_name = 'Лебедев'   AND first_name = 'Максим'    LIMIT 1), 'Москва',               'Москва',          'Хамовнический тупик',        '7',   'к. 1','23'),
      ((SELECT id FROM employees WHERE last_name = 'Кузнецова' AND first_name = 'Наталья'   LIMIT 1), 'Новосибирская область','Новосибирск',     'ул. Вокзальная магистраль',  '16',  NULL,  '54'),
      ((SELECT id FROM employees WHERE last_name = 'Орлов'     AND first_name = 'Виктор'    LIMIT 1), 'Калужская область',    'Калуга',          'ул. Кирова',                 '9',   NULL,  '3'),
      ((SELECT id FROM employees WHERE last_name = 'Захарова'  AND first_name = 'Юлия'      LIMIT 1), 'Краснодарский край',   'Краснодар',       'ул. Северная',               '311', 'к. 2','19'),
      ((SELECT id FROM employees WHERE last_name = 'Смирнов'   AND first_name = 'Павел'     LIMIT 1), 'Омская область',       'Омск',            'пр. Маркса',                 '60',  NULL,  '41'),
      ((SELECT id FROM employees WHERE last_name = 'Фёдорова'  AND first_name = 'Ирина'     LIMIT 1), 'Ростовская область',   'Ростов-на-Дону',  'пр. Чехова',                 '28',  'к. 4','7'),
      ((SELECT id FROM employees WHERE last_name = 'Никитин'   AND first_name = 'Роман'     LIMIT 1), 'Оренбургская область', 'Оренбург',        'ул. Советская',              '18',  NULL,  '92');
  `);

  pgm.sql(`
    INSERT INTO hr_operations (employee_id, department_id, position_id, type)
    VALUES
      -- Приёмы на работу (hire)
      (
        (SELECT id FROM employees  WHERE last_name = 'Иванов'    AND first_name = 'Александр' LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел разработки'          LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Руководитель отдела разработки' LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Петрова'   AND first_name = 'Мария'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел кадров'              LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Специалист по подбору персонала' LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Сидоров'   AND first_name = 'Дмитрий'   LIMIT 1),
        (SELECT id FROM departments WHERE name = 'IT-инфраструктура'         LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Системный администратор'   LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Козлова'   AND first_name = 'Анна'      LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел аналитики'           LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Аналитик данных'           LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Новиков'   AND first_name = 'Андрей'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Группа backend-разработки' LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Разработчик'               LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Морозова'  AND first_name = 'Елена'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Бухгалтерия'               LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Главный бухгалтер'         LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Волков'    AND first_name = 'Сергей'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Департамент консалтинга'   LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Менеджер проекта'          LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Соколова'  AND first_name = 'Ольга'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Техническая поддержка'     LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Специалист технической поддержки' LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Лебедев'   AND first_name = 'Максим'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Группа backend-разработки' LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Разработчик'               LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Кузнецова' AND first_name = 'Наталья'   LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Сектор расчета зарплаты'   LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Бухгалтер'                 LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Орлов'     AND first_name = 'Виктор'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Юридический отдел'         LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Юрисконсульт'              LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Захарова'  AND first_name = 'Юлия'      LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Группа frontend-разработки' LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Разработчик'               LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Смирнов'   AND first_name = 'Павел'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел логистики'           LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Менеджер проекта'          LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Фёдорова'  AND first_name = 'Ирина'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Финансовый департамент'    LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Финансовый директор'       LIMIT 1),
        'hire'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Никитин'   AND first_name = 'Роман'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'IT-инфраструктура'         LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Технический директор'      LIMIT 1),
        'hire'
      ),
      -- Повышения и изменения зарплаты (salary_change)
      (
        (SELECT id FROM employees  WHERE last_name = 'Новиков'   AND first_name = 'Андрей'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Группа backend-разработки' LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Старший разработчик'       LIMIT 1),
        'salary_change'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Козлова'   AND first_name = 'Анна'      LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел аналитики'           LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Аналитик данных'           LIMIT 1),
        'salary_change'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Кузнецова' AND first_name = 'Наталья'   LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Сектор расчета зарплаты'   LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Бухгалтер'                 LIMIT 1),
        'salary_change'
      ),
      -- Переводы (transfer)
      (
        (SELECT id FROM employees  WHERE last_name = 'Лебедев'   AND first_name = 'Максим'    LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Группа frontend-разработки' LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Разработчик'               LIMIT 1),
        'transfer'
      ),
      (
        (SELECT id FROM employees  WHERE last_name = 'Сидоров'   AND first_name = 'Дмитрий'   LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел тестирования'        LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Системный администратор'   LIMIT 1),
        'transfer'
      ),
      -- Увольнения (fire)
      (
        (SELECT id FROM employees  WHERE last_name = 'Смирнов'   AND first_name = 'Павел'     LIMIT 1),
        (SELECT id FROM departments WHERE name = 'Отдел логистики'           LIMIT 1),
        (SELECT id FROM positions   WHERE name = 'Менеджер проекта'          LIMIT 1),
        'fire'
      );
  `);

  pgm.sql(`
    INSERT INTO salary_changes (operation_id, old_salary, new_salary, reason)
    VALUES
      -- Начальные оклады при приёме (hire)
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Иванов'    AND e.first_name = 'Александр' AND o.type = 'hire' LIMIT 1),
        0, 180000.00, 'Начальный оклад при приёме на должность руководителя отдела разработки'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Петрова'   AND e.first_name = 'Мария'     AND o.type = 'hire' LIMIT 1),
        0, 75000.00, 'Начальный оклад при приёме на должность специалиста по подбору персонала'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Сидоров'   AND e.first_name = 'Дмитрий'   AND o.type = 'hire' LIMIT 1),
        0, 110000.00, 'Начальный оклад при приёме на должность системного администратора'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Козлова'   AND e.first_name = 'Анна'      AND o.type = 'hire' LIMIT 1),
        0, 95000.00, 'Начальный оклад при приёме на должность аналитика данных'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Новиков'   AND e.first_name = 'Андрей'    AND o.type = 'hire' LIMIT 1),
        0, 120000.00, 'Начальный оклад при приёме на должность разработчика'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Морозова'  AND e.first_name = 'Елена'     AND o.type = 'hire' LIMIT 1),
        0, 130000.00, 'Начальный оклад при приёме на должность главного бухгалтера'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Волков'    AND e.first_name = 'Сергей'    AND o.type = 'hire' LIMIT 1),
        0, 140000.00, 'Начальный оклад при приёме на должность менеджера проекта'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Соколова'  AND e.first_name = 'Ольга'     AND o.type = 'hire' LIMIT 1),
        0, 70000.00, 'Начальный оклад при приёме на должность специалиста технической поддержки'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Лебедев'   AND e.first_name = 'Максим'    AND o.type = 'hire' LIMIT 1),
        0, 115000.00, 'Начальный оклад при приёме на должность разработчика'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Кузнецова' AND e.first_name = 'Наталья'   AND o.type = 'hire' LIMIT 1),
        0, 65000.00, 'Начальный оклад при приёме на должность бухгалтера'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Орлов'     AND e.first_name = 'Виктор'    AND o.type = 'hire' LIMIT 1),
        0, 125000.00, 'Начальный оклад при приёме на должность юрисконсульта'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Захарова'  AND e.first_name = 'Юлия'      AND o.type = 'hire' LIMIT 1),
        0, 100000.00, 'Начальный оклад при приёме на должность разработчика'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Смирнов'   AND e.first_name = 'Павел'     AND o.type = 'hire' LIMIT 1),
        0, 135000.00, 'Начальный оклад при приёме на должность менеджера проекта'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Фёдорова'  AND e.first_name = 'Ирина'     AND o.type = 'hire' LIMIT 1),
        0, 200000.00, 'Начальный оклад при приёме на должность финансового директора'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Никитин'   AND e.first_name = 'Роман'     AND o.type = 'hire' LIMIT 1),
        0, 190000.00, 'Начальный оклад при приёме на должность технического директора'
      ),
      -- Изменения оклада (salary_change)
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Новиков'   AND e.first_name = 'Андрей'    AND o.type = 'salary_change' LIMIT 1),
        120000.00, 155000.00, 'Повышение оклада в связи с переводом на должность старшего разработчика'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Козлова'   AND e.first_name = 'Анна'      AND o.type = 'salary_change' LIMIT 1),
        95000.00, 115000.00, 'Повышение оклада по результатам годовой аттестации'
      ),
      (
        (SELECT o.id FROM hr_operations o JOIN employees e ON e.id = o.employee_id
          WHERE e.last_name = 'Кузнецова' AND e.first_name = 'Наталья'   AND o.type = 'salary_change' LIMIT 1),
        65000.00, 72000.00, 'Индексация заработной платы'
      );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DELETE FROM salary_changes
    WHERE operation_id IN (
      SELECT o.id FROM hr_operations o
      JOIN employees e ON e.id = o.employee_id
      WHERE (e.last_name, e.first_name) IN (
        ('Иванов', 'Александр'), ('Петрова', 'Мария'),     ('Сидоров', 'Дмитрий'),
        ('Козлова', 'Анна'),     ('Новиков', 'Андрей'),    ('Морозова', 'Елена'),
        ('Волков', 'Сергей'),    ('Соколова', 'Ольга'),    ('Лебедев', 'Максим'),
        ('Кузнецова', 'Наталья'),('Орлов', 'Виктор'),      ('Захарова', 'Юлия'),
        ('Смирнов', 'Павел'),    ('Фёдорова', 'Ирина'),    ('Никитин', 'Роман')
      )
    );
  `);

  pgm.sql(`
    DELETE FROM hr_operations
    WHERE employee_id IN (
      SELECT id FROM employees
      WHERE (last_name, first_name) IN (
        ('Иванов', 'Александр'), ('Петрова', 'Мария'),     ('Сидоров', 'Дмитрий'),
        ('Козлова', 'Анна'),     ('Новиков', 'Андрей'),    ('Морозова', 'Елена'),
        ('Волков', 'Сергей'),    ('Соколова', 'Ольга'),    ('Лебедев', 'Максим'),
        ('Кузнецова', 'Наталья'),('Орлов', 'Виктор'),      ('Захарова', 'Юлия'),
        ('Смирнов', 'Павел'),    ('Фёдорова', 'Ирина'),    ('Никитин', 'Роман')
      )
    );
  `);

  pgm.sql(`
    DELETE FROM addresses
    WHERE employee_id IN (
      SELECT id FROM employees
      WHERE (last_name, first_name) IN (
        ('Иванов', 'Александр'), ('Петрова', 'Мария'),     ('Сидоров', 'Дмитрий'),
        ('Козлова', 'Анна'),     ('Новиков', 'Андрей'),    ('Морозова', 'Елена'),
        ('Волков', 'Сергей'),    ('Соколова', 'Ольга'),    ('Лебедев', 'Максим'),
        ('Кузнецова', 'Наталья'),('Орлов', 'Виктор'),      ('Захарова', 'Юлия'),
        ('Смирнов', 'Павел'),    ('Фёдорова', 'Ирина'),    ('Никитин', 'Роман')
      )
    );
  `);

  pgm.sql(`
    DELETE FROM passports
    WHERE employee_id IN (
      SELECT id FROM employees
      WHERE (last_name, first_name) IN (
        ('Иванов', 'Александр'), ('Петрова', 'Мария'),     ('Сидоров', 'Дмитрий'),
        ('Козлова', 'Анна'),     ('Новиков', 'Андрей'),    ('Морозова', 'Елена'),
        ('Волков', 'Сергей'),    ('Соколова', 'Ольга'),    ('Лебедев', 'Максим'),
        ('Кузнецова', 'Наталья'),('Орлов', 'Виктор'),      ('Захарова', 'Юлия'),
        ('Смирнов', 'Павел'),    ('Фёдорова', 'Ирина'),    ('Никитин', 'Роман')
      )
    );
  `);

  pgm.sql(`
    DELETE FROM employees
    WHERE (last_name, first_name) IN (
      ('Иванов', 'Александр'), ('Петрова', 'Мария'),     ('Сидоров', 'Дмитрий'),
      ('Козлова', 'Анна'),     ('Новиков', 'Андрей'),    ('Морозова', 'Елена'),
      ('Волков', 'Сергей'),    ('Соколова', 'Ольга'),    ('Лебедев', 'Максим'),
      ('Кузнецова', 'Наталья'),('Орлов', 'Виктор'),      ('Захарова', 'Юлия'),
      ('Смирнов', 'Павел'),    ('Фёдорова', 'Ирина'),    ('Никитин', 'Роман')
    );
  `);

  pgm.sql(`
    DELETE FROM file_categories
    WHERE name IN (
      'Паспорт', 'СНИЛС', 'ИНН', 'Трудовая книжка', 'Диплом об образовании',
      'Медицинская книжка', 'Трудовой договор', 'Приказ о приёме',
      'Приказ об увольнении', 'Согласие на обработку ПДн',
      'Военный билет', 'Сертификат / Удостоверение'
    );
  `);
};
