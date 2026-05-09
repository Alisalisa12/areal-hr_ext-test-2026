# Учет сотрудников

Веб-приложение для ведения кадрового учета сотрудников в нескольких организациях.

## Окружение разработки

- **ОС:** Windows 10 с WSL2
- **IDE:** Visual Studio Code
- **СУБД:** PostgreSQL 17 через Docker Compose

## Технологический стек

- **Frontend:** Vue.js 3.5, Quasar Framework, Vite
- **Backend:** Node.js 22, NestJS 11
- **Database:** PostgreSQL 17
- **Storage:** MinIO
- **Authentication** Argon2id, Passport Local Strategy
- **Documentation:** VitePress, Draw.io (ERD)
- **Deployment:** Docker, Docker Compose, Nginx, Git/Github

## Библиотеки

- `pg` — основной драйвер для работы с PostgreSQL.
- `node-pg-migrate` — управление миграциями структуры БД.
- `@nestjs/passport` — модуль для идентификации и аутентификации.
- `joi` — валидация входящих данных.
-

## Схема базы данных (ERD)

![ER-диаграмма базы данных](./db/schema_db.png)

## Установка и запуск

1. Клонировать репозиторий `https://github.com/Alisalisa12/areal-hr_ext-test-2026`

2. Создать файл `.env` на основе примера:

3. Собрать и запустить контейнеры: `docker compose up -d --build`

## Данные для входа

- Администратор:
  - логин: `admin`
  - пароль: `admin123`
- Менеджер:
  - логин: `manager`
  - пароль: `manager123`

_Для начала работы перейдите в раздел [Установка и запуск](#установка-и-запуск)._

## Подробные инструкции по работе с системой:

Доступ к сайту имеют только авторизованные пользователи с ролью "Менеджер" или "Администратор".

- [**Инструкция администратора**](./admin-guide.md) 
- [**Инструкция менеджера**](./manager-guide.md)