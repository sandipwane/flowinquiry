# Mailpit Setup for Local Email Testing

Mailpit catches all outgoing emails locally - no SMTP server needed.

## Quick Start

```bash
# Install
brew install mailpit

# Run
mailpit
```

- SMTP: `localhost:1025`
- Web UI: http://localhost:8025

## Database Configuration

Insert mail settings (backend uses Docker, so use `host.docker.internal`):

```sql
INSERT INTO fw_app_settings (setting_key, setting_value, setting_type, setting_group, description) VALUES
('mail.host', 'host.docker.internal', 'string', 'email', 'SMTP host'),
('mail.port', '1025', 'int', 'email', 'SMTP port'),
('mail.username', '', 'string', 'email', 'SMTP username'),
('mail.password', '', 'string', 'email', 'SMTP password'),
('mail.protocol', 'smtp', 'string', 'email', 'Mail protocol'),
('mail.from', 'noreply@flowinquiry.io', 'string', 'email', 'From address'),
('mail.smtp.auth', 'false', 'boolean', 'email', 'SMTP auth'),
('mail.smtp.starttls.enable', 'false', 'boolean', 'email', 'STARTTLS'),
('mail.base_url', 'http://localhost:1234', 'string', 'email', 'Base URL');
```

Run via Docker:
```bash
docker exec flowinquiry-postgresql-1 psql -U flowinquiry -d flowinquiry -c "<SQL above>"
```

## Restart Backend

```bash
docker compose -f apps/ops/flowinquiry-docker/services_http.yml restart back-end
```

Verify in logs:
```
MailService configured and ready to send emails.
```

## Usage

1. Create a user in the app
2. Check http://localhost:8025 for the email
3. Click activation link from Mailpit

## Notes

- `host.docker.internal` allows Docker container to reach host's Mailpit
- For non-Docker backend, use `localhost` instead
- Mailpit stores emails in temp DB, cleared on restart
