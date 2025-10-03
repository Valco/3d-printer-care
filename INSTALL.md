# 📦 Інструкція з встановлення 3D Printer Care на Ubuntu Server

Повна покрокова інструкція для розгортання проекту з GitHub на власному сервері Ubuntu.

## 📋 Вимоги

- Ubuntu Server 20.04 LTS або новіше
- Доступ через SSH з правами sudo
- Доменне ім'я (опціонально, для SSL)

---

## 🚀 Крок 1: Підключення до сервера

```bash
ssh your_user@your_server_ip
```

---

## 🔄 Крок 2: Оновлення системи

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 📦 Крок 3: Встановлення Node.js 20.x

```bash
# Додайте репозиторій NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Встановіть Node.js
sudo apt install -y nodejs

# Перевірте версію
node --version
npm --version
```

---

## 🗄️ Крок 4: Встановлення PostgreSQL

```bash
# Встановіть PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запустіть PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Перевірте статус
sudo systemctl status postgresql
```

---

## 🔐 Крок 5: Створення бази даних через SQL

### Варіант А: Створення порожньої бази (для використання з міграціями)

```bash
# Увійдіть як користувач postgres
sudo -u postgres psql

# Виконайте SQL команди:
```

```sql
-- Створіть базу даних
CREATE DATABASE printer_care;

-- Створіть користувача
CREATE USER printer_user WITH PASSWORD 'your_strong_password_here';

-- Надайте всі привілеї
GRANT ALL PRIVILEGES ON DATABASE printer_care TO printer_user;

-- Підключіться до бази
\c printer_care

-- Надайте права на схему
GRANT ALL ON SCHEMA public TO printer_user;

-- Вийдіть
\q
```

### Варіант Б: Відновлення з готового дампу (з даними)

```bash
# Створіть базу та користувача (команди вище)
# Потім виконайте:

# Завантажте дамп з репозиторію (після клонування)
cd ~/3d-printer-care
psql -U printer_user -d printer_care -f database_backup.sql
```

---

## 🌐 Крок 6: Встановлення Nginx

```bash
# Встановіть Nginx
sudo apt install -y nginx

# Запустіть Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Перевірте статус
sudo systemctl status nginx
```

---

## ⚙️ Крок 7: Встановлення PM2 (Process Manager)

```bash
# Встановіть PM2 глобально
sudo npm install -g pm2

# Перевірте версію
pm2 --version
```

---

## 📥 Крок 8: Клонування проекту з GitHub

```bash
# Перейдіть в домашню директорію
cd ~

# Клонуйте проект
git clone https://github.com/YOUR_USERNAME/3d-printer-care.git

# Перейдіть в директорію проекту
cd 3d-printer-care
```

---

## 🔑 Крок 9: Налаштування змінних середовища

```bash
# Створіть файл .env
nano .env
```

Додайте наступний вміст (замініть значення на свої):

```env
# Database Configuration
DATABASE_URL=postgresql://printer_user:your_strong_password_here@localhost:5432/printer_care
PGHOST=localhost
PGPORT=5432
PGDATABASE=printer_care
PGUSER=printer_user
PGPASSWORD=your_strong_password_here

# Session Secret (згенеруйте випадковий ключ мінімум 32 символи)
SESSION_SECRET=your_random_secret_key_min_32_characters_long_here

# Environment
NODE_ENV=production
PORT=5000
```

**Для генерації SESSION_SECRET виконайте:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Збережіть файл: `Ctrl+O`, Enter, `Ctrl+X`

---

## 📦 Крок 10: Встановлення залежностей

```bash
# Встановіть npm залежності
npm install
```

---

## 🗄️ Крок 11: Налаштування бази даних

### Якщо використовуєте Варіант А (порожня база):

```bash
# Виконайте міграції
npm run db:push

# Заповніть базу початковими даними
npm run db:seed
```

### Якщо використовуєте Варіант Б (готовий дамп):

```bash
# Імпортуйте дамп бази даних
psql -U printer_user -d printer_care -f database_backup.sql

# Або через sudo:
sudo -u postgres psql -d printer_care -f database_backup.sql
```

---

## 🏗️ Крок 12: Збірка проекту

```bash
# Зберіть production версію
npm run build
```

---

## 🚀 Крок 13: Налаштування PM2

```bash
# Створіть конфігураційний файл PM2
nano ecosystem.config.js
```

Додайте наступний вміст (замініть `your_user` та `3d-printer-care` на свої):

```javascript
module.exports = {
  apps: [{
    name: '3d-printer-care',
    script: 'npm',
    args: 'start',
    cwd: '/home/your_user/3d-printer-care',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Створіть директорію для логів
mkdir -p logs

# Запустіть додаток через PM2
pm2 start ecosystem.config.js

# Збережіть конфігурацію PM2
pm2 save

# Налаштуйте автозапуск при перезавантаженні
pm2 startup
# Виконайте команду, яку покаже PM2

# Перевірте статус
pm2 status

# Подивіться логи
pm2 logs 3d-printer-care
```

---

## 🌐 Крок 14: Налаштування Nginx як Reverse Proxy

```bash
# Створіть конфігураційний файл Nginx
sudo nano /etc/nginx/sites-available/3d-printer-care
```

Додайте наступний вміст (замініть `your_domain.com` на ваш домен):

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Максимальний розмір файлу для завантаження
    client_max_body_size 50M;
}
```

```bash
# Активуйте конфігурацію
sudo ln -s /etc/nginx/sites-available/3d-printer-care /etc/nginx/sites-enabled/

# Видаліть конфігурацію за замовчуванням (опціонально)
sudo rm /etc/nginx/sites-enabled/default

# Перевірте конфігурацію Nginx
sudo nginx -t

# Перезапустіть Nginx
sudo systemctl restart nginx
```

---

## 🔒 Крок 15: Налаштування SSL/HTTPS (Let's Encrypt)

```bash
# Встановіть Certbot
sudo apt install -y certbot python3-certbot-nginx

# Отримайте SSL сертифікат
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Виберіть опцію "2" для автоматичного редиректу HTTP -> HTTPS

# Перевірте автоматичне оновлення сертифіката
sudo systemctl status certbot.timer

# Тестове оновлення (не обов'язково)
sudo certbot renew --dry-run
```

---

## 🔥 Крок 16: Налаштування Firewall

```bash
# Дозвольте SSH
sudo ufw allow OpenSSH

# Дозвольте HTTP та HTTPS
sudo ufw allow 'Nginx Full'

# Увімкніть firewall
sudo ufw enable

# Перевірте статус
sudo ufw status
```

---

## ✅ Крок 17: Перевірка роботи

```bash
# Перевірте статус PM2
pm2 status

# Перевірте логи додатку
pm2 logs 3d-printer-care

# Перевірте статус Nginx
sudo systemctl status nginx

# Перевірте статус PostgreSQL
sudo systemctl status postgresql

# Перевірте логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

Відкрийте браузер та перейдіть на:
- HTTP: `http://your_domain.com`
- HTTPS: `https://your_domain.com`

---

## 👤 Тестові користувачі

Після встановлення ви можете увійти з наступними обліковими даними:

```
Адміністратор:
Email: admin@example.com
Пароль: admin123

Оператор:
Email: operator@example.com
Пароль: admin123

Технік:
Email: technician@example.com
Пароль: admin123

Спостерігач:
Email: viewer@example.com
Пароль: admin123
```

**⚠️ ВАЖЛИВО:** Змініть паролі після першого входу!

---

## 🔄 Оновлення проекту

Коли потрібно оновити проект до нової версії:

```bash
# Перейдіть в директорію проекту
cd ~/3d-printer-care

# Отримайте останні зміни з GitHub
git pull origin main

# Встановіть нові залежності (якщо є)
npm install

# Виконайте міграції (якщо є)
npm run db:push

# Пересоберіть проект
npm run build

# Перезапустіть PM2
pm2 restart 3d-printer-care

# Перевірте логи
pm2 logs 3d-printer-care
```

---

## 🗄️ Резервне копіювання бази даних

### Створення бекапу

```bash
# Бекап бази даних
pg_dump -U printer_user -d printer_care > backup_$(date +%Y%m%d_%H%M%S).sql

# Бекап з компресією
pg_dump -U printer_user -d printer_care | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Відновлення з бекапу

```bash
# Відновлення з звичайного бекапу
psql -U printer_user -d printer_care < backup_20251002_120000.sql

# Відновлення з компресованого бекапу
gunzip -c backup_20251002_120000.sql.gz | psql -U printer_user -d printer_care
```

---

## 🛠️ Корисні команди

### PM2

```bash
# Статус всіх процесів
pm2 status

# Логи в реальному часі
pm2 logs 3d-printer-care

# Моніторинг ресурсів
pm2 monit

# Перезапуск
pm2 restart 3d-printer-care

# Зупинка
pm2 stop 3d-printer-care

# Видалення з PM2
pm2 delete 3d-printer-care

# Очистка логів
pm2 flush
```

### Nginx

```bash
# Перевірка конфігурації
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Статус
sudo systemctl status nginx

# Логи помилок
sudo tail -f /var/log/nginx/error.log

# Логи доступу
sudo tail -f /var/log/nginx/access.log
```

### PostgreSQL

```bash
# Вхід в psql
sudo -u postgres psql

# Вхід як printer_user
psql -U printer_user -d printer_care

# Статус служби
sudo systemctl status postgresql

# Перезапуск PostgreSQL
sudo systemctl restart postgresql

# Список баз даних
sudo -u postgres psql -l
```

### Система

```bash
# Перегляд використання дискового простору
df -h

# Перегляд використання пам'яті
free -h

# Перегляд запущених процесів Node.js
ps aux | grep node

# Перегляд відкритих портів
sudo netstat -tulpn | grep LISTEN
```

---

## 🐛 Усунення несправностей

### Проблема: Додаток не запускається

```bash
# Перевірте логи PM2
pm2 logs 3d-printer-care --lines 100

# Перевірте змінні середовища
cat .env

# Перевірте підключення до бази даних
psql -U printer_user -d printer_care -c "SELECT 1"
```

### Проблема: Nginx показує 502 Bad Gateway

```bash
# Перевірте, чи працює додаток
pm2 status

# Перевірте, чи слухає додаток на порту 5000
sudo netstat -tulpn | grep 5000

# Перевірте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Проблема: Не можу підключитися до бази даних

```bash
# Перевірте статус PostgreSQL
sudo systemctl status postgresql

# Перевірте з'єднання
psql -U printer_user -d printer_care

# Перевірте права доступу
sudo -u postgres psql -c "SELECT * FROM pg_user WHERE usename = 'printer_user'"
```

### Проблема: SSL сертифікат не працює

```bash
# Перевірте статус сертифіката
sudo certbot certificates

# Спробуйте оновити
sudo certbot renew --dry-run

# Перевірте конфігурацію Nginx
sudo nginx -t
```

---

## 📊 Моніторинг

### Налаштування моніторингу з PM2

```bash
# PM2 Plus (опціонально)
pm2 link your_secret_key your_public_key

# Або використовуйте вбудований моніторинг
pm2 monit
```

### Налаштування логів

```bash
# Ротація логів PM2
pm2 install pm2-logrotate

# Налаштування
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

---

## 🔐 Безпека

### Рекомендації з безпеки

1. **Змініть паролі за замовчуванням**
   - Змініть паролі всіх тестових користувачів
   - Використовуйте складні паролі

2. **Оновлюйте систему**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Налаштуйте fail2ban** (опціонально)
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

4. **Обмежте SSH доступ**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # PermitRootLogin no
   # PasswordAuthentication no (якщо використовуєте SSH ключі)
   sudo systemctl restart sshd
   ```

5. **Регулярні бекапи**
   - Налаштуйте автоматичне резервне копіювання бази даних
   - Зберігайте бекапи в безпечному місці

---

## 🎉 Готово!

Ваш проект **3D Printer Care** успішно розгорнуто!

Доступ: `https://your_domain.com`

Для питань та підтримки створіть issue в GitHub репозиторії.

---

**Зроблено з ❤️ для 3D-друку спільноти**
