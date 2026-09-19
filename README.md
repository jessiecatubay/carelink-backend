
```
backend
├─ package-lock.json
├─ package.json
├─ prisma
│  ├─ migrations
│  │  ├─ 20260724072230_new_changes
│  │  │  └─ migration.sql
│  │  ├─ 20260811020307_added_nullable_at_role
│  │  │  └─ migration.sql
│  │  ├─ 20260811021123_remove_nullable
│  │  │  └─ migration.sql
│  │  ├─ 20260812024750_removed_device
│  │  │  └─ migration.sql
│  │  ├─ 20260902014428_added_sensor_contact
│  │  │  └─ migration.sql
│  │  ├─ 20260903030104_added_remote
│  │  │  └─ migration.sql
│  │  ├─ 20260903033329_added_remote_model
│  │  │  └─ migration.sql
│  │  ├─ 20260903044221_new_changes
│  │  │  └─ migration.sql
│  │  ├─ 20260904025341_new_changes
│  │  │  └─ migration.sql
│  │  ├─ 20260904132505_optional_status
│  │  │  └─ migration.sql
│  │  ├─ 20260904132755_optional
│  │  │  └─ migration.sql
│  │  ├─ 20260905011930_added_joints
│  │  │  └─ migration.sql
│  │  ├─ 20260905030911_added_current_patient
│  │  │  └─ migration.sql
│  │  ├─ 20260905064004_new_changes
│  │  │  └─ migration.sql
│  │  ├─ 20260905064231_new_changes
│  │  │  └─ migration.sql
│  │  ├─ 20260905070000_rename_caregiver_to_non_patient
│  │  │  └─ migration.sql
│  │  ├─ 20260906125152_added_patient_id_commands
│  │  │  └─ migration.sql
│  │  ├─ 20260909030209_added_refresh_token
│  │  │  └─ migration.sql
│  │  ├─ 20260909030716_added_token
│  │  │  └─ migration.sql
│  │  ├─ 20260911013259_added_command_connection
│  │  │  └─ migration.sql
│  │  ├─ 20260913011701_added_current_patient
│  │  │  └─ migration.sql
│  │  ├─ 20260918131625_add_pill_reminders
│  │  │  └─ migration.sql
│  │  ├─ 20260918131909_add
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ prisma.config.ts
├─ src
│  ├─ app.ts
│  ├─ controllers
│  │  ├─ command.controller.ts
│  │  ├─ device.controller.ts
│  │  ├─ patient-nonpatient.controller.ts
│  │  ├─ patient-profile.controller.ts
│  │  └─ user.controller.ts
│  ├─ generated
│  ├─ lib
│  │  ├─ expo.ts
│  │  ├─ gemini.ts
│  │  ├─ prisma.ts
│  │  └─ socket.ts
│  ├─ middlewares
│  │  ├─ auth-middleware.ts
│  │  ├─ authenticate-token.ts
│  │  └─ validate-schema.ts
│  ├─ repositories
│  │  ├─ auth.repository.ts
│  │  ├─ command.repository.ts
│  │  ├─ patient-nonpatient-repository.ts
│  │  ├─ patient-profile.repository.ts
│  │  ├─ token.repository.ts
│  │  ├─ user.repository.ts
│  │  └─ vitals-history.repository.ts
│  ├─ routes
│  │  ├─ command.routes.ts
│  │  ├─ device.routes.ts
│  │  ├─ index.ts
│  │  ├─ patient-nonpatient.routes.ts
│  │  ├─ patient-profile.routes.ts
│  │  └─ user.routes.ts
│  ├─ schemas
│  │  ├─ command.schema.ts
│  │  ├─ common.schema.ts
│  │  ├─ connection.schema.ts
│  │  ├─ device.schema.ts
│  │  ├─ socket.schema.ts
│  │  └─ user.schema.ts
│  ├─ server.ts
│  ├─ services
│  │  ├─ auth
│  │  │  ├─ get-me-service.ts
│  │  │  ├─ index.ts
│  │  │  └─ refresh-token-service.ts
│  │  ├─ command
│  │  │  ├─ create-command.ts
│  │  │  ├─ get-all-commands.ts
│  │  │  ├─ get-latest-command.ts
│  │  │  ├─ get-recent-command.ts
│  │  │  ├─ index.ts
│  │  │  └─ update-command.ts
│  │  ├─ device
│  │  │  ├─ create-vitals-history.ts
│  │  │  ├─ get-full-vitals-history.ts
│  │  │  ├─ get-recent-vitals-history.ts
│  │  │  └─ index.ts
│  │  ├─ mail
│  │  │  ├─ mailer.ts
│  │  │  └─ templates
│  │  │     └─ verify-email.html
│  │  ├─ mqtt.service.ts
│  │  ├─ notification.service.ts
│  │  ├─ patientNonpatient
│  │  │  ├─ connect-patientNonpatient-service.ts
│  │  │  ├─ create-patientNonpatient-service.ts
│  │  │  ├─ find-connected-nonpatient.ts
│  │  │  ├─ index.ts
│  │  │  └─ update-patientNonpatient-service.ts
│  │  ├─ patientProfile
│  │  │  ├─ generate-connection-code-service.ts
│  │  │  ├─ index.ts
│  │  │  └─ update-patient-profile-service.ts
│  │  └─ user
│  │     ├─ get-user-by-id-service.ts
│  │     ├─ index.ts
│  │     ├─ login-service.ts
│  │     ├─ signup-service.ts
│  │     ├─ update-service.ts
│  │     └─ user-onboarding-service.ts
│  ├─ types
│  │  └─ user.ts
│  └─ utils
│     ├─ generateConnectionCode.ts
│     ├─ jwt.ts
│     ├─ pagination.ts
│     ├─ password.ts
│     └─ template.ts
├─ test
│  └─ pagination.test.ts
└─ tsconfig.json

```