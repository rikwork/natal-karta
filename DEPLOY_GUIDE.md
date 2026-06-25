# Инструкция по настройке автоматического деплоя (GitHub Actions)

Воркфлоу настроен в файле [.github/workflows/deploy.yml](file:///Users/nikita/projects/natal_karta/.github/workflows/deploy.yml). Для того чтобы деплой заработал после `git push`, необходимо выполнить два шага: настроить секреты в репозитории на GitHub и один раз авторизовать Docker на вашем сервере VPS.

---

## Шаг 1. Добавление секретов в GitHub

Перейдите в ваш репозиторий на GitHub: **ggrikgg/natal-karta** -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret** и добавьте три секрета:

1. **`SSH_HOST`**
   * **Значение:** `185.204.53.72`

2. **`SSH_USERNAME`**
   * **Значение:** `deployer`

3. **`SSH_KEY`**
   * **Значение:** Скопируйте содержимое вашего приватного SSH-ключа (обычно находится в локальном файле `~/.ssh/id_rsa` или другом ключе, через который вы заходите на сервер).
   * *Убедитесь, что скопировали ключ полностью, включая строки `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`.*

---

## Шаг 2. Авторизация Docker на VPS-сервере

Поскольку GitHub Container Registry (GHCR) по умолчанию хранит образы приватно, вашему VPS-серверу необходимы права для скачивания (pull) образа.

1. **Сгенерируйте Personal Access Token (PAT) на GitHub:**
   * Перейдите в настройки вашего аккаунта GitHub: **Settings** -> **Developer settings** -> **Personal access tokens** -> **Tokens (classic)** -> **Generate new token (classic)**.
   * Назовите токен, например, `vps-pull-packages`.
   * Выберите срок действия (например, `No expiration` или 90 дней).
   * Выделите галочку: **`read:packages`** (этого достаточно для скачивания образов).
   * Нажмите **Generate token** и скопируйте полученное значение (оно начинается с `ghp_`).

2. **Авторизуйтесь в Docker на сервере:**
   Подключитесь к вашему серверу по SSH и выполните команду авторизации:
   ```bash
   ssh deployer@185.204.53.72
   
   # Выполните команду (после ввода команды вставьте ваш скопированный токен ghp_...)
   echo "ВАШ_GITHUB_PAT_ТОКЕН" | docker login ghcr.io -u ggrikgg --password-stdin
   ```
   *После этого Docker на сервере запомнит ваши учетные данные, и GitHub Actions сможет успешно отправлять команды `docker compose pull`.*

---

## Процесс деплоя (как запустить)

После того как секреты добавлены и авторизация пройдена:
1. Вы делаете коммит и пушите код в ветку `main`:
   ```bash
   git add .
   git commit -m "feat: setup github actions deployment"
   git push origin main
   ```
2. Перейдите во вкладку **Actions** в репозитории на GitHub, чтобы следить за процессом сборки и деплоя.
3. Бэкенд автоматически соберется и перезапустится на сервере без остановки вашего приложения!
