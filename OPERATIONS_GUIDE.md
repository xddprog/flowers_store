# Эксплуатация, деплой и резервное копирование проекта Lascovo

Документ составлен по текущему состоянию репозитория. Если на сервере есть файлы, которых нет в репозитории, особенно `/etc/nginx/sites-available/lascovo.ru`, `/etc/letsencrypt` и возможный настоящий `.env`, их нужно проверить вручную на сервере.

## 1. Из чего состоит проект

В корне проекта есть:

- `docker-compose.yml` - основной способ production-запуска.
- `frontend/` - React + TypeScript + Vite приложение.
- `frontend/Dockerfile` - собирает frontend и кладет production build в nginx-контейнер.
- `frontend/nginx.conf` - nginx-конфиг внутри frontend-контейнера.
- `backend/` - FastAPI backend.
- `backend/Dockerfile` - собирает Python-контейнер backend.
- `backend/.env.example` - пример переменных окружения для backend.
- `backend/migrations/` и `backend/alembic.ini` - Alembic настроен, но файлов версий миграций сейчас нет.
- `backend/scripts/parse_lascovo.py` - парсер товаров с `lascovo.ru`.
- `static/` - пользовательские/static-файлы проекта, сейчас там лежат изображения букетов.
- `README_FOR_CUSTOMER.md` - краткая памятка для заказчика.

Makefile и CI/CD-конфиги в проекте не найдены.

## 2. Контейнеры Docker Compose

`docker-compose.yml` описывает 4 сервиса.

`db`

- container name: `db-store`
- image: `postgres:15`
- порт наружу: `5433:5432`
- внутри docker-сети доступен как `db:5432`
- переменные: `POSTGRES_USER=postgres123`, `POSTGRES_PASSWORD=postgres123`, `POSTGRES_DB=postgres123`
- явный named volume для `/var/lib/postgresql/data` не задан

`app`

- container name: `app-store`
- build context: `./backend`
- запускает `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- порт наружу: `8000:8000`
- подключается к БД по `DB_HOST=db`, `DB_PORT=5432`
- получает переменные окружения прямо из `docker-compose.yml`
- монтирует `./static:/app/static`

`frontend`

- container name: `frontend-store`
- build context: `./frontend`
- build arg: `VITE_API_URL=https://api.lascovo.ru`
- внутри Dockerfile сначала собирается Vite build, затем nginx отдает файлы из `/usr/share/nginx/html`
- порт наружу: `5173:80`
- зависит от `app`

`nginx`

- container name: `nginx-proxy`
- image: `nginx:latest`
- порты наружу: `80:80`, `443:443`
- монтирует:
  - `/etc/nginx/sites-available/lascovo.ru:/etc/nginx/conf.d/lascovo.ru.conf`
  - `/etc/letsencrypt:/etc/letsencrypt:ro`
  - `./static:/var/www/static`
- зависит от `app`
- внешний nginx-конфиг в репозитории отсутствует, поэтому реальные правила проксирования доменов нужно смотреть на сервере

Все сервисы подключены к bridge-сети `app-network`.

## 3. Как работает деплой этого проекта

Схема frontend:

```text
Git commit
↓
сервер с репозиторием
↓
git pull
↓
docker compose build frontend
↓
frontend/Dockerfile
↓
npm install
↓
npm run build
↓
/app/dist внутри builder-stage
↓
копирование dist в /usr/share/nginx/html внутри frontend-контейнера
↓
nginx внутри frontend-store отдает SPA
↓
внешний nginx-proxy проксирует домен на frontend-store или порт 5173
↓
браузер пользователя
```

Схема backend:

```text
Git commit
↓
сервер с репозиторием
↓
git pull
↓
docker compose build app
↓
backend/Dockerfile
↓
pip install -r requirements.txt
↓
playwright install --with-deps chromium
↓
uvicorn app.main:app на 8000
↓
app-store подключается к db:5432
↓
FastAPI отдает /api/v1, /admin и /static
```

Схема данных:

```text
PostgreSQL db-store
↓
таблицы товаров, типов, заказов, платежей, админов, клиентов

./static на сервере
↓
/app/static в backend-контейнере
↓
/var/www/static в nginx-proxy
↓
static/images/bouquets/*.webp
```

Во время `docker compose up`:

1. Compose создает сеть `flowers_store_app-network` или аналогичную сеть проекта.
2. Поднимает `db-store` из `postgres:15`.
3. Ждет healthcheck БД для `app`. Важно: healthcheck сейчас проверяет `pg_isready -d postgres -U postgres`, хотя БД и пользователь заданы как `postgres123`; это нужно проверить на сервере.
4. Собирает или использует готовый образ `app-store`, запускает FastAPI.
5. При старте backend вызывает `Base.metadata.create_all`, затем выполняет идемпотентный `ALTER TABLE bouquets ADD COLUMN IF NOT EXISTS price_to INTEGER`.
6. Backend вызывает `init_test_db`: если в таблице `flower_types` нет данных, он создает типы цветов, типы букетов, пытается импортировать букеты парсером и создает админа `admin/admin`.
7. Собирает или использует готовый frontend-образ.
8. Запускает `frontend-store`, внутри которого nginx отдает статический Vite build.
9. Запускает `nginx-proxy`, который использует внешний серверный конфиг и SSL-сертификаты.

## 4. Где лежит production build frontend

Локально после `npm run build` build лежит в:

```text
frontend/dist
```

В Docker production-сборке `frontend/dist` не монтируется с хоста. Он создается внутри builder-stage Dockerfile и копируется в финальный nginx image:

```text
/usr/share/nginx/html
```

Именно этот каталог отдает nginx внутри контейнера `frontend-store`.

## 5. Как frontend общается с backend

Frontend берет API base URL из:

```text
import.meta.env.VITE_API_URL
```

Если переменная не задана, используется:

```text
http://localhost:8000
```

В Docker Compose при сборке frontend передается:

```text
VITE_API_URL=https://api.lascovo.ru
```

Значит production frontend отправляет запросы на `https://api.lascovo.ru`, например:

```text
https://api.lascovo.ru/api/v1/bouquet/search
https://api.lascovo.ru/api/v1/bouquet/popular
https://api.lascovo.ru/admin/auth/...
```

Изображения товаров backend возвращает как абсолютные URL через `APP_CONFIG.STATIC_URL`. В compose сейчас:

```text
STATIC_URL=https://api.lascovo.ru/static/images
```

Если в БД хранится `bouquets/file.webp`, frontend получит:

```text
https://api.lascovo.ru/static/images/bouquets/file.webp
```

## 6. Где хранятся данные

### PostgreSQL

В БД хранятся:

- букеты;
- изображения букетов как строки `image_path`, но не сами файлы;
- типы букетов;
- типы цветов;
- связи букетов и типов цветов;
- заказы;
- товары внутри заказов;
- платежи;
- админы;
- заблокированные клиенты или клиентские записи, если они используются текущими роутами.

В compose нет явного volume:

```yaml
db:
  image: postgres:15
```

Официальный postgres image использует `/var/lib/postgresql/data` как volume, но в этом проекте ему не назначено стабильное имя. На практике это опасно: данные могут остаться в anonymous volume после удаления контейнера, но новый контейнер не обязан подключиться к тому же volume. Для надежной эксплуатации нужно вручную проверить на сервере `docker inspect db-store` и список volumes.

### Изображения товаров

Физические файлы изображений лежат в:

```text
static/images/bouquets/*.webp
```

Backend видит их как:

```text
/app/static/images/bouquets/*.webp
```

nginx-proxy видит их как:

```text
/var/www/static/images/bouquets/*.webp
```

При загрузке через админку `ImageService` конвертирует файлы в WebP и сохраняет в `static/images/bouquets`.

### Статические изображения frontend

Файлы из:

```text
frontend/public/images
```

попадают в frontend production build. Это часть кода/репозитория, а не пользовательские загрузки.

### .env и секреты

В репозитории найден только:

```text
backend/.env.example
```

Настоящий `.env` не найден. При этом production-секреты и пароли сейчас лежат прямо в `docker-compose.yml`. Это важно бэкапить и защищать как секретный файл.

### SSL и nginx

Compose монтирует:

```text
/etc/letsencrypt
/etc/nginx/sites-available/lascovo.ru
```

Эти файлы не находятся в репозитории. Они критичны для production-сервера и должны попадать в backup сервера отдельно.

## 7. Что сохранится и что удалится

`docker compose down`

- остановит и удалит контейнеры `db-store`, `app-store`, `frontend-store`, `nginx-proxy`;
- удалит compose-сеть;
- не удалит файлы проекта на сервере;
- не удалит `./static`;
- не удалит `/etc/letsencrypt`;
- не удалит `/etc/nginx/sites-available/lascovo.ru`;
- не должен удалять anonymous volumes, но новый контейнер БД может не подхватить старый anonymous volume автоматически.

`docker compose down -v`

- сделает все из `docker compose down`;
- дополнительно удалит volumes, связанные с compose-проектом;
- для текущей схемы БД это особенно опасно, потому что данные PostgreSQL могут быть в anonymous volume.

`docker compose build`

- пересобирает Docker images;
- не должен удалять БД;
- не должен удалять `./static`.

`docker compose up -d --build`

- пересобирает изменившиеся образы;
- пересоздает контейнеры при необходимости;
- не должен удалять `./static`;
- риск для БД связан не с build, а с отсутствием явного стабильного volume у `db`.

Критически важно не потерять:

- PostgreSQL data directory или dump БД;
- `static/images/bouquets`;
- production `docker-compose.yml` с реальными секретами;
- `/etc/nginx/sites-available/lascovo.ru`;
- `/etc/letsencrypt`;
- любые server-only `.env`, если они есть на сервере.

## 8. Как выкатывать обновления

Ниже команды предполагают, что проект на сервере лежит в папке с `docker-compose.yml`.

Перейти на сервер:

```bash
ssh user@server
```

Перейти в папку проекта:

```bash
cd /path/to/flowers_store
```

Проверить текущее состояние:

```bash
git status
docker compose ps
```

Забрать изменения:

```bash
git pull
```

### Если изменился только frontend

Нужно пересобрать frontend image, потому что Vite build создается внутри `frontend/Dockerfile`.

```bash
docker compose build frontend
docker compose up -d frontend
```

Или одной командой:

```bash
docker compose up -d --build frontend
```

Что будет затронуто:

- пересоберется image frontend;
- пересоздастся `frontend-store`;
- `app-store`, `db-store`, `nginx-proxy` обычно останутся работать, если их конфигурация не изменилась;
- БД и изображения не должны потеряться.

Проверить:

```bash
docker compose ps
docker compose logs -f frontend
curl -I http://127.0.0.1:5173/
```

Через браузер открыть сайт и проверить, что загружены новые JS/CSS assets. Можно также посмотреть HTML:

```bash
docker compose exec frontend sh -c 'ls -lah /usr/share/nginx/html && ls -lah /usr/share/nginx/html/assets | tail'
```

### Если изменился backend

Нужно пересобрать backend image.

```bash
docker compose build app
docker compose up -d app
```

Или:

```bash
docker compose up -d --build app
```

Что будет затронуто:

- пересоберется image backend;
- пересоздастся `app-store`;
- `db-store` должен остаться;
- `frontend-store` обычно не нужно пересобирать, если API URL и frontend-код не менялись;
- `nginx-proxy` обычно не нужно пересоздавать.

Проверить:

```bash
docker compose ps
docker compose logs -f app
curl -I http://127.0.0.1:8000/docs
```

### Если изменились зависимости frontend

Если менялись `frontend/package.json` или `frontend/package-lock.json`, обязательно пересобрать frontend:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

`--no-cache` нужен, если есть сомнения, что Docker cache использовал старый слой `npm install`.

### Если изменились зависимости backend

Если менялся `backend/requirements.txt`, пересобрать backend:

```bash
docker compose build --no-cache app
docker compose up -d app
```

### Если изменились миграции БД

Сейчас в `backend/migrations` нет файлов версий Alembic, а backend при старте сам делает `create_all` и один ручной `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. Поэтому стандартного production-процесса миграций в проекте фактически нет.

Если в будущем появятся Alembic revisions, порядок должен быть таким:

1. Сделать backup БД.
2. Обновить код.
3. Пересобрать backend.
4. Выполнить миграции внутри backend-контейнера:

```bash
docker compose exec app alembic upgrade head
```

5. Перезапустить backend:

```bash
docker compose up -d app
```

Перед применением на production обязательно проверить, что `alembic upgrade head` реально работает с переменными окружения контейнера.

### Если изменился docker-compose.yml

Проверить итоговую конфигурацию:

```bash
docker compose config
```

Затем применить:

```bash
docker compose up -d --build
```

Если менялись volumes БД, сначала обязательно сделать dump PostgreSQL и копию `static`.

## 9. Как понять, что деплой успешен

Проверить контейнеры:

```bash
docker compose ps
```

Посмотреть логи:

```bash
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f db
```

Проверить frontend:

```bash
curl -I http://127.0.0.1:5173/
```

Проверить backend:

```bash
curl -I http://127.0.0.1:8000/docs
```

Проверить внешний домен:

```bash
curl -I https://www.lascovo.ru/
curl -I https://api.lascovo.ru/docs
curl -I https://api.lascovo.ru/static/images/bouquets/
```

Последняя команда может вернуть не `200`, если листинг директорий запрещен. Для проверки конкретного изображения лучше использовать реальный URL из БД или админки.

## 10. Ежедневная памятка деплоя

1. `ssh user@server`
2. `cd /path/to/flowers_store`
3. `git pull`
4. `docker compose up -d --build frontend` для frontend или `docker compose up -d --build app` для backend
5. `docker compose ps` и `docker compose logs -f frontend app`

Перед изменениями БД или volumes сначала сделать backup.

## 11. Backup: что нужно сохранять

Чек-лист:

- [ ] PostgreSQL: dump БД `postgres123`.
- [ ] Файлы товаров: `static/images/bouquets`.
- [ ] Весь каталог `static`, если появятся другие пользовательские файлы.
- [ ] `docker-compose.yml`, потому что в нем сейчас production-секреты.
- [ ] Настоящий `.env`, если он есть на сервере.
- [ ] `/etc/nginx/sites-available/lascovo.ru`.
- [ ] `/etc/letsencrypt`.
- [ ] Git commit hash текущей версии.
- [ ] Список Docker volumes и `docker inspect db-store`.

Что не нужно бэкапить как данные:

- `frontend/node_modules`;
- `frontend/dist`, если его можно пересобрать из git;
- Docker images, если есть исходники и lock-файлы;
- кэш npm/pip.

## 12. Backup PostgreSQL

Создать папку для backup на сервере:

```bash
mkdir -p backups
```

Сделать dump:

```bash
docker compose exec -T db pg_dump -U postgres123 -d postgres123 -Fc > backups/postgres_$(date +%Y-%m-%d_%H-%M-%S).dump
```

Если shell не подставляет дату в нужном виде, используйте простое имя:

```bash
docker compose exec -T db pg_dump -U postgres123 -d postgres123 -Fc > backups/postgres.dump
```

Проверить, что файл не пустой:

```bash
ls -lh backups/postgres.dump
```

Проверить структуру dump:

```bash
docker compose exec -T db pg_restore -l < backups/postgres.dump
```

Сделать plain SQL dump, если нужен читаемый текст:

```bash
docker compose exec -T db pg_dump -U postgres123 -d postgres123 > backups/postgres.sql
```

Важно: backup PostgreSQL не включает файлы изображений из `static/images/bouquets`. В БД лежат только строки путей к изображениям.

## 13. Restore PostgreSQL на новом сервере

1. Установить Docker и Docker Compose.
2. Склонировать репозиторий.
3. Положить production `docker-compose.yml`, nginx-конфиг, SSL и `static`.
4. Запустить только БД:

```bash
docker compose up -d db
```

5. Убедиться, что БД доступна:

```bash
docker compose ps
docker compose logs db
```

6. Восстановить custom-format dump.

Если БД пустая:

```bash
docker compose exec -T db pg_restore -U postgres123 -d postgres123 --clean --if-exists < backups/postgres.dump
```

Если нужно сначала пересоздать БД, будьте осторожны: это удалит текущие данные.

```bash
docker compose exec -T db psql -U postgres123 -d postgres123 -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
docker compose exec -T db pg_restore -U postgres123 -d postgres123 < backups/postgres.dump
```

7. Вернуть файлы static:

```bash
rsync -a backups/static/ static/
```

8. Поднять все сервисы:

```bash
docker compose up -d --build
```

9. Проверить сайт, API и изображения.

## 14. Backup файлов проекта и static

Сохранить `static`:

```bash
mkdir -p backups
tar -czf backups/static_$(date +%Y-%m-%d_%H-%M-%S).tar.gz static
```

Восстановить:

```bash
tar -xzf backups/static_YYYY-MM-DD_HH-MM-SS.tar.gz
```

Если восстанавливаете на новый сервер, убедитесь, что каталог оказался именно:

```text
/path/to/flowers_store/static
```

Проверить:

```bash
find static/images/bouquets -type f | head
```

## 15. Backup nginx и SSL

На production-сервере сохранить nginx-конфиг:

```bash
sudo tar -czf backups/nginx_lascovo_$(date +%Y-%m-%d_%H-%M-%S).tar.gz /etc/nginx/sites-available/lascovo.ru
```

Сохранить Let's Encrypt:

```bash
sudo tar -czf backups/letsencrypt_$(date +%Y-%m-%d_%H-%M-%S).tar.gz /etc/letsencrypt
```

Восстановление этих файлов зависит от ОС и прав. После восстановления проверить:

```bash
sudo nginx -t
docker compose restart nginx
```

Если сертификаты не восстановлены, их нужно перевыпустить через certbot на сервере.

## 16. Самые опасные места

`docker compose down -v`

- может удалить volume с PostgreSQL;
- в текущем проекте особенно опасно, потому что у БД нет явного named volume.

Удаление контейнера `db-store`

- может привести к тому, что новый контейнер получит новый anonymous volume и старая БД не подключится автоматически.

Удаление `static`

- удалит физические изображения товаров;
- БД останется с путями, но картинки на сайте пропадут.

Удаление или потеря `docker-compose.yml`

- сейчас это потеря не только инфраструктурного файла, но и production-секретов: пароля БД, JWT secret, SMTP, Telegram bot token, Yandex Pay API key.

Смена `STATIC_URL`

- может сломать URL изображений, которые backend возвращает frontend.

Смена `VITE_API_URL`

- требует пересборки frontend image, потому что переменная встраивается в Vite build на этапе сборки.

Миграции без backup

- Alembic настроен, но production-процесс миграций не закреплен файлами revisions;
- backend сейчас сам создает таблицы и добавляет только `price_to`;
- любые ручные изменения схемы нужно делать только после dump.

Автоинициализация данных при пустой БД

- при старте backend, если нет `flower_types`, проект пытается заполнить тестовые/начальные данные и импортировать букеты с сайта через парсер;
- на production это может быть неожиданным поведением после потери БД.

Healthcheck БД

- compose healthcheck проверяет `postgres/postgres`, а реальная БД и пользователь называются `postgres123`;
- нужно проверить на production, что `db-store` становится healthy.

Секреты в git/compose

- текущий `docker-compose.yml` содержит реальные секреты;
- нельзя публиковать этот файл в открытый доступ;
- лучше вынести секреты в `.env` и хранить `.env` отдельно, но это уже изменение инфраструктуры и должно делаться отдельной задачей.

## 17. Что нужно проверить вручную на production

Этой информации нет в репозитории:

- реальное содержимое `/etc/nginx/sites-available/lascovo.ru`;
- какие upstream/locations настроены для `www.lascovo.ru` и `api.lascovo.ru`;
- какие Docker volumes реально подключены к `db-store`;
- есть ли server-only `.env`;
- где на сервере лежит папка проекта;
- как выпускаются и обновляются SSL-сертификаты;
- есть ли внешние cron/backup-скрипты;
- есть ли firewall/security group правила;
- есть ли CI/CD вне репозитория.

Команды для проверки:

```bash
docker inspect db-store
docker volume ls
docker compose ps
docker compose config
sudo cat /etc/nginx/sites-available/lascovo.ru
sudo ls -lah /etc/letsencrypt
```

## 18. Рекомендуемый минимальный регламент backup

Ежедневно:

- PostgreSQL dump.
- Архив `static`.

После каждого изменения инфраструктуры:

- копия `docker-compose.yml`;
- копия nginx-конфига;
- запись commit hash.

После обновления SSL:

- backup `/etc/letsencrypt`.

Перед миграциями или ручной правкой БД:

- PostgreSQL dump;
- проверка dump через `pg_restore -l`;
- копия `static`.

## 19. Быстрое восстановление после сбоя

1. Подготовить новый сервер с Docker и Docker Compose.
2. Склонировать проект.
3. Вернуть production `docker-compose.yml`.
4. Вернуть `/etc/nginx/sites-available/lascovo.ru`.
5. Вернуть `/etc/letsencrypt` или перевыпустить сертификаты.
6. Вернуть `static`.
7. Запустить `docker compose up -d db`.
8. Восстановить dump PostgreSQL.
9. Запустить `docker compose up -d --build`.
10. Проверить:

```bash
docker compose ps
docker compose logs -f app
curl -I https://www.lascovo.ru/
curl -I https://api.lascovo.ru/docs
```

## 20. Главное для себя через полгода

Этот проект не деплоится через CI/CD из репозитория. Рабочий сценарий по текущим файлам: зайти на сервер, сделать `git pull`, пересобрать нужный Docker image и поднять сервис через `docker compose up -d`.

Frontend собирается не на сервере вручную в `frontend/dist`, а внутри `frontend/Dockerfile`. Итоговый build лежит в nginx image по пути `/usr/share/nginx/html`.

Backend - FastAPI-контейнер `app-store`, который ходит в PostgreSQL по `db:5432`. При старте backend сам создает таблицы через SQLAlchemy `create_all` и пытается инициализировать начальные данные, если БД пустая.

Изображения товаров не находятся в БД. В БД только пути, сами файлы лежат в `static/images/bouquets`. Без backup `static` сайт потеряет картинки даже при целой БД.

Самый опасный момент - PostgreSQL без явного named volume в compose. Перед любыми действиями с `down -v`, volumes, контейнером `db-store` или переносом сервера обязательно сделать `pg_dump` и проверить backup.

Минимальная команда обновления frontend:

```bash
git pull
docker compose up -d --build frontend
docker compose ps
```

Минимальная команда обновления backend:

```bash
git pull
docker compose up -d --build app
docker compose ps
```

Минимальный backup:

```bash
mkdir -p backups
docker compose exec -T db pg_dump -U postgres123 -d postgres123 -Fc > backups/postgres.dump
tar -czf backups/static.tar.gz static
```

Перед реальным восстановлением сначала проверить, что backup БД читается:

```bash
docker compose exec -T db pg_restore -l < backups/postgres.dump
```
