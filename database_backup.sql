-- ============================================================================
-- 3D PRINTER CARE - ПОВНИЙ ДАМП БАЗИ ДАНИХ
-- ============================================================================
-- 
-- ІНСТРУКЦІЇ З ВИКОРИСТАННЯ:
-- 
-- 1. Створення нової бази даних:
--    CREATE DATABASE printer_care;
-- 
-- 2. Підключення до бази даних:
--    \c printer_care
-- 
-- 3. Виконання цього SQL файлу:
--    \i database_backup.sql
--    або через psql:
--    psql -U your_user -d printer_care -f database_backup.sql
-- 
-- УВАГА: Цей дамп містить:
-- - Структуру всіх таблиць (CREATE TABLE)
-- - Всі дані (INSERT INTO)
-- - Індекси та обмеження (CONSTRAINTS)
-- 
-- Дата створення дампу: 2025-10-02
-- ============================================================================

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: MaintenanceTask; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceTask" (
    id text NOT NULL,
    title text NOT NULL,
    "categoryId" text,
    "intervalType" text NOT NULL,
    "intervalValue" integer NOT NULL,
    "defaultInstructions" text,
    priority integer DEFAULT 5 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "customFieldLabel" text,
    "customFieldType" text,
    "requiresAxis" boolean DEFAULT false NOT NULL,
    "requiresNozzleSize" boolean DEFAULT false NOT NULL,
    "requiresPlasticType" boolean DEFAULT false NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Printer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Printer" (
    id text NOT NULL,
    name text NOT NULL,
    model text,
    "serialNumber" text,
    location text,
    "ipAddress" text,
    notes text,
    visibility text DEFAULT 'PUBLIC'::text NOT NULL,
    "printHours" integer DEFAULT 0 NOT NULL,
    "jobsCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrinterEmailRecipient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrinterEmailRecipient" (
    id text NOT NULL,
    "printerId" text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrinterGroupAccess; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrinterGroupAccess" (
    id text NOT NULL,
    "printerId" text NOT NULL,
    "groupId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PrinterTaskSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrinterTaskSchedule" (
    id text NOT NULL,
    "printerId" text NOT NULL,
    "taskId" text NOT NULL,
    "lastCompleted" timestamp(3) without time zone,
    "nextDue" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastCompletedJobsCount" integer,
    "lastCompletedPrintHours" integer
);


--
-- Name: SMTPSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SMTPSettings" (
    id text NOT NULL,
    host text NOT NULL,
    port integer NOT NULL,
    secure boolean NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "fromEmail" text NOT NULL,
    "fromName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reminderTime" character varying DEFAULT '08:00'::character varying
);


--
-- Name: TaskCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaskCategory" (
    id text NOT NULL,
    name text NOT NULL,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TelegramSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TelegramSettings" (
    id text NOT NULL,
    "botToken" text NOT NULL,
    "chatId" text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "notifyOverdue" boolean DEFAULT true NOT NULL,
    "notifyToday" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reminderTime" character varying DEFAULT '08:00'::character varying
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role text DEFAULT 'VIEWER'::text NOT NULL,
    "groupId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "telegramNickname" text
);


--
-- Name: UserGroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserGroup" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: WorkLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkLog" (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "printerId" text NOT NULL,
    "taskId" text,
    "nozzleSize" text,
    "printHoursAtLog" integer,
    "jobsCountAtLog" integer,
    details text,
    "performedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    axis text,
    "customFieldValue" text,
    "plasticType" text
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: MaintenanceTask MaintenanceTask_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceTask"
    ADD CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PrinterEmailRecipient PrinterEmailRecipient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterEmailRecipient"
    ADD CONSTRAINT "PrinterEmailRecipient_pkey" PRIMARY KEY (id);


--
-- Name: PrinterGroupAccess PrinterGroupAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterGroupAccess"
    ADD CONSTRAINT "PrinterGroupAccess_pkey" PRIMARY KEY (id);


--
-- Name: PrinterTaskSchedule PrinterTaskSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterTaskSchedule"
    ADD CONSTRAINT "PrinterTaskSchedule_pkey" PRIMARY KEY (id);


--
-- Name: Printer Printer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Printer"
    ADD CONSTRAINT "Printer_pkey" PRIMARY KEY (id);


--
-- Name: SMTPSettings SMTPSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SMTPSettings"
    ADD CONSTRAINT "SMTPSettings_pkey" PRIMARY KEY (id);


--
-- Name: TaskCategory TaskCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskCategory"
    ADD CONSTRAINT "TaskCategory_pkey" PRIMARY KEY (id);


--
-- Name: TelegramSettings TelegramSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TelegramSettings"
    ADD CONSTRAINT "TelegramSettings_pkey" PRIMARY KEY (id);


--
-- Name: UserGroup UserGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserGroup"
    ADD CONSTRAINT "UserGroup_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WorkLog WorkLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkLog"
    ADD CONSTRAINT "WorkLog_pkey" PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: PrinterEmailRecipient_printerId_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrinterEmailRecipient_printerId_email_key" ON public."PrinterEmailRecipient" USING btree ("printerId", email);


--
-- Name: PrinterGroupAccess_printerId_groupId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrinterGroupAccess_printerId_groupId_key" ON public."PrinterGroupAccess" USING btree ("printerId", "groupId");


--
-- Name: PrinterTaskSchedule_printerId_taskId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PrinterTaskSchedule_printerId_taskId_key" ON public."PrinterTaskSchedule" USING btree ("printerId", "taskId");


--
-- Name: TaskCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TaskCategory_name_key" ON public."TaskCategory" USING btree (name);


--
-- Name: UserGroup_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserGroup_name_key" ON public."UserGroup" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: MaintenanceTask MaintenanceTask_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceTask"
    ADD CONSTRAINT "MaintenanceTask_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."TaskCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PrinterEmailRecipient PrinterEmailRecipient_printerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterEmailRecipient"
    ADD CONSTRAINT "PrinterEmailRecipient_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES public."Printer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrinterGroupAccess PrinterGroupAccess_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterGroupAccess"
    ADD CONSTRAINT "PrinterGroupAccess_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."UserGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrinterGroupAccess PrinterGroupAccess_printerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterGroupAccess"
    ADD CONSTRAINT "PrinterGroupAccess_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES public."Printer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrinterTaskSchedule PrinterTaskSchedule_printerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterTaskSchedule"
    ADD CONSTRAINT "PrinterTaskSchedule_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES public."Printer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrinterTaskSchedule PrinterTaskSchedule_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrinterTaskSchedule"
    ADD CONSTRAINT "PrinterTaskSchedule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MaintenanceTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."UserGroup"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkLog WorkLog_completedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkLog"
    ADD CONSTRAINT "WorkLog_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkLog WorkLog_printerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkLog"
    ADD CONSTRAINT "WorkLog_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES public."Printer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkLog WorkLog_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkLog"
    ADD CONSTRAINT "WorkLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MaintenanceTask"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: TaskCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TaskCategory" VALUES ('a0080345-1b29-47b7-b596-5078d3dea299', 'Очищення', 'Процедури очищення', '2025-10-02 14:27:57.169');
INSERT INTO public."TaskCategory" VALUES ('84e8f26a-21d9-4f02-9a0c-642f9e1eba60', 'Заміна частин', 'Заміна зношених компонентів', '2025-10-02 14:27:57.169');
INSERT INTO public."TaskCategory" VALUES ('2cf3a40f-55e5-437a-9874-78eb12a6a8bc', 'Калібрування', 'Калібрування та налаштування', '2025-10-02 14:27:57.169');
INSERT INTO public."TaskCategory" VALUES ('cbb1cb2f-276c-46a2-b86f-fdb8e305f6cb', 'Змащування', 'Змащування механізмів', '2025-10-02 14:27:57.169');
INSERT INTO public."TaskCategory" VALUES ('79098d89-40aa-4e5c-8d75-4851b92d968c', 'Огляд', 'Регулярні огляди', '2025-10-02 14:27:57.169');


--
-- Data for Name: MaintenanceTask; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MaintenanceTask" VALUES ('446184b8-dbcb-44ac-81ff-3c6126c8581a', 'Заміна фільтра', '84e8f26a-21d9-4f02-9a0c-642f9e1eba60', 'PRINT_HOURS', 300, NULL, 2, '2025-10-02 20:31:35.874', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('6bfb4339-9fa2-472d-97ff-e6643b8837c5', 'Очищення екструдера', 'a0080345-1b29-47b7-b596-5078d3dea299', 'PRINT_HOURS', 100, NULL, 8, '2025-10-02 20:31:35.874', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('fb1e51cf-6e20-4041-b5d3-2cbd53c138c5', 'Калібрування потоку', '2cf3a40f-55e5-437a-9874-78eb12a6a8bc', 'DAYS', 45, NULL, 3, '2025-10-02 20:31:35.874', NULL, NULL, false, true, true);
INSERT INTO public."MaintenanceTask" VALUES ('7a039f6d-c184-4722-ba82-78d9b259bd1e', 'Калібрування столу', '2cf3a40f-55e5-437a-9874-78eb12a6a8bc', 'DAYS', 30, NULL, 9, '2025-10-02 20:31:35.874', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('7940a67e-8751-48bc-92bc-686895bc823e', 'Перевірка ременів', '79098d89-40aa-4e5c-8d75-4851b92d968c', 'DAYS', 90, NULL, 5, '2025-10-02 20:31:35.874', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('e6b71360-3a74-40cb-88b0-8107dd4c582d', 'Заміна сопла', '84e8f26a-21d9-4f02-9a0c-642f9e1eba60', 'PRINT_HOURS', 500, NULL, 7, '2025-10-02 20:31:35.875', NULL, NULL, false, true, false);
INSERT INTO public."MaintenanceTask" VALUES ('4b42cf7d-ac38-4668-be97-c15403ced54c', 'Очищення столу', 'a0080345-1b29-47b7-b596-5078d3dea299', 'JOB_COUNT', 50, NULL, 4, '2025-10-02 20:31:35.876', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('40fb747d-aea6-4f4a-b09b-1d6041820173', 'Змащування осей', 'cbb1cb2f-276c-46a2-b86f-fdb8e305f6cb', 'DAYS', 60, NULL, 6, '2025-10-02 20:31:35.876', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('f7c0e908-a8ba-44ad-b9b4-715009317962', 'Загальний огляд', '79098d89-40aa-4e5c-8d75-4851b92d968c', 'DAYS', 14, NULL, 10, '2025-10-02 20:31:35.875', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('60254ec7-5b8c-4037-bf50-dc09b7a44db3', 'Термінове калібрування Z осі', '2cf3a40f-55e5-437a-9874-78eb12a6a8bc', 'DAYS', 7, NULL, 9, '2025-10-02 20:31:36.826', NULL, NULL, true, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('12d5f81e-d52b-4e8a-bd1d-64722f6f00dd', 'Заміна мастила в екструдері', 'cbb1cb2f-276c-46a2-b86f-fdb8e305f6cb', 'DAYS', 10, NULL, 7, '2025-10-02 20:31:36.89', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('18adf1bc-851a-4518-906d-56eccd829fa9', 'Критична перевірка натягу ременів', '79098d89-40aa-4e5c-8d75-4851b92d968c', 'DAYS', 14, '', 8, '2025-10-02 20:31:36.858', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('674c436c-6dd2-4880-9efd-0b6521930f05', 'Тест: Протерміноване 1', 'a0080345-1b29-47b7-b596-5078d3dea299', 'DAYS', 30, NULL, 5, '2025-10-02 21:14:48.592', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('d4cc0a89-959d-4142-8e1e-00dab6aefe29', 'Тест: Протерміноване 2', 'a0080345-1b29-47b7-b596-5078d3dea299', 'DAYS', 30, NULL, 7, '2025-10-02 21:14:48.592', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('3de1ca5f-1176-47bf-be8c-18009a769109', 'Тест: Протерміноване 3', 'a0080345-1b29-47b7-b596-5078d3dea299', 'DAYS', 30, NULL, 3, '2025-10-02 21:14:48.592', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('0dc0813b-773e-45f8-8663-2674192e81e8', 'Тест: Сьогодні 1', 'a0080345-1b29-47b7-b596-5078d3dea299', 'DAYS', 30, NULL, 5, '2025-10-02 21:14:48.592', NULL, NULL, false, false, false);
INSERT INTO public."MaintenanceTask" VALUES ('e811a464-3b7b-44ca-8379-0e20884b0b66', 'Тест: Сьогодні 2', 'a0080345-1b29-47b7-b596-5078d3dea299', 'DAYS', 30, NULL, 7, '2025-10-02 21:14:48.592', NULL, NULL, false, false, false);


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Printer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Printer" VALUES ('ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', 'X1C-002', 'BambuLab X1C', 'X1C2023-002', 'Lab Room 1', '192.168.1.101', NULL, 'PUBLIC', 1250, 420, '2025-10-02 20:31:35.601');
INSERT INTO public."Printer" VALUES ('ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'A1-001', 'BambuLab A1', 'A12023-001', 'Lab Room 2', '192.168.1.102', '', 'RESTRICTED', 1, 1, '2025-10-02 20:31:35.601');


--
-- Data for Name: PrinterEmailRecipient; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PrinterEmailRecipient" VALUES ('8727d38a-e2c5-4eef-a65a-fc7112550f3b', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', 'tech2@example.com', '2025-10-02 20:31:35.736');
INSERT INTO public."PrinterEmailRecipient" VALUES ('e99bbfaa-4a81-40ff-8b98-35f0bf79a1b6', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', 'tech1@example.com', '2025-10-02 20:31:35.736');
INSERT INTO public."PrinterEmailRecipient" VALUES ('c8c2d789-b564-47a1-b876-efbf274a518e', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'admin@example.com', '2025-10-02 21:05:08.309');
INSERT INTO public."PrinterEmailRecipient" VALUES ('6fbdb7cc-d624-430c-bc67-37fa5a31e980', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'operator@example.com', '2025-10-02 21:05:08.309');


--
-- Data for Name: UserGroup; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."UserGroup" VALUES ('65ed7155-a23a-4887-b579-a450bba79845', 'Технік', 'Технічні спеціалісти', '2025-10-02 14:27:56.466');
INSERT INTO public."UserGroup" VALUES ('5ae44222-94d3-4d04-8081-dc63afd54fa1', 'Оператор', 'Оператори принтерів', '2025-10-02 14:27:56.466');
INSERT INTO public."UserGroup" VALUES ('318a97d2-8425-4af8-b362-baa45dbb3d19', 'Адмін', 'Адміністратори системи', '2025-10-02 14:27:56.466');
INSERT INTO public."UserGroup" VALUES ('ef9fc579-6f09-44fe-ba29-9e355ed519f0', 'Користувач', 'Користувачі з read-only доступом', '2025-10-02 14:27:56.467');


--
-- Data for Name: PrinterGroupAccess; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PrinterGroupAccess" VALUES ('31397d3d-1363-419d-98ac-096056e8b83a', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '65ed7155-a23a-4887-b579-a450bba79845', '2025-10-02 21:05:08.128');


--
-- Data for Name: PrinterTaskSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PrinterTaskSchedule" VALUES ('28d3ac6e-6f17-44a2-80a1-abf05f728a80', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '7a039f6d-c184-4722-ba82-78d9b259bd1e', '2025-09-08 20:31:36.153', '2025-10-08 20:31:36.153', true, '2025-10-02 20:31:36.154', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('d0b1b925-ceaf-40ee-8bd9-ec9817142c80', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '6bfb4339-9fa2-472d-97ff-e6643b8837c5', '2025-10-01 20:31:36.219', NULL, true, '2025-10-02 20:31:36.221', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('6d96c060-345e-4996-907c-69122d6d8cba', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', 'e6b71360-3a74-40cb-88b0-8107dd4c582d', '2025-10-01 20:31:36.253', NULL, true, '2025-10-02 20:31:36.255', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('88d790a5-80d9-429f-b605-fad6f39749ce', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '40fb747d-aea6-4f4a-b09b-1d6041820173', '2025-08-15 20:31:36.288', '2025-10-14 20:31:36.288', true, '2025-10-02 20:31:36.289', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('8eff9907-b595-4d69-adbe-f647dc771a61', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '7940a67e-8751-48bc-92bc-686895bc823e', '2025-07-22 20:31:36.32', '2025-10-20 20:31:36.32', true, '2025-10-02 20:31:36.321', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('151bbf81-96b1-4230-873c-b103ae84c546', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '4b42cf7d-ac38-4668-be97-c15403ced54c', '2025-09-25 20:31:36.353', NULL, true, '2025-10-02 20:31:36.354', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('f5e2eaed-1293-44e4-b25a-ff72b64bca81', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', 'fb1e51cf-6e20-4041-b5d3-2cbd53c138c5', '2025-08-27 20:31:36.385', '2025-10-11 20:31:36.385', true, '2025-10-02 20:31:36.386', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('bde3d2d8-7381-4978-8e97-2a1beb4de86f', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '446184b8-dbcb-44ac-81ff-3c6126c8581a', '2025-10-01 20:31:36.441', NULL, true, '2025-10-02 20:31:36.442', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('908d82fb-ce2b-4963-94d6-67209c1eceba', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '7a039f6d-c184-4722-ba82-78d9b259bd1e', '2025-09-08 20:31:36.504', '2025-10-08 20:31:36.504', true, '2025-10-02 20:31:36.505', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('f26b6f05-976c-48ce-8b86-a9a202cc1cad', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '6bfb4339-9fa2-472d-97ff-e6643b8837c5', '2025-10-01 20:31:36.536', NULL, true, '2025-10-02 20:31:36.537', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('5da7d914-03c7-4fdb-87a5-f2f2fb416989', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'e6b71360-3a74-40cb-88b0-8107dd4c582d', '2025-10-01 20:31:36.568', NULL, true, '2025-10-02 20:31:36.569', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('9a932fad-357e-4253-a86c-c67493e4fbdd', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '40fb747d-aea6-4f4a-b09b-1d6041820173', '2025-08-15 20:31:36.601', '2025-10-14 20:31:36.601', true, '2025-10-02 20:31:36.602', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('9e61034c-6d49-4254-86ee-23f764836dcd', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '7940a67e-8751-48bc-92bc-686895bc823e', '2025-07-22 20:31:36.632', '2025-10-20 20:31:36.632', true, '2025-10-02 20:31:36.634', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('0ee144bf-749c-4644-a64c-f232a329e977', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '4b42cf7d-ac38-4668-be97-c15403ced54c', '2025-09-25 20:31:36.664', NULL, true, '2025-10-02 20:31:36.666', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('df2d8cd1-cf56-41b9-9148-797f6582f36f', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'fb1e51cf-6e20-4041-b5d3-2cbd53c138c5', '2025-08-27 20:31:36.697', '2025-10-11 20:31:36.697', true, '2025-10-02 20:31:36.698', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('97d9dc24-eefc-46e5-a61b-932e28529503', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '446184b8-dbcb-44ac-81ff-3c6126c8581a', '2025-10-01 20:31:36.759', NULL, true, '2025-10-02 20:31:36.76', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('49765369-c8a7-443c-a549-a3a256912fdc', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'f7c0e908-a8ba-44ad-b9b4-715009317962', '2025-09-21 20:31:36.792', '2025-10-05 20:31:36.792', true, '2025-10-02 20:31:36.793', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('45776b72-9816-4d68-8d9d-0ac0250cc264', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '60254ec7-5b8c-4037-bf50-dc09b7a44db3', '2025-09-22 20:31:36.92', '2025-09-27 20:31:36.92', true, '2025-10-02 20:31:36.921', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('d8ee06f5-203d-4311-bc07-fa19a6672063', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '18adf1bc-851a-4518-906d-56eccd829fa9', '2025-09-12 20:31:36.953', '2025-09-29 20:31:36.92', true, '2025-10-02 20:31:36.954', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('8be7bc9b-55d4-4b10-b19b-32be337ede95', 'ba0143e7-6696-4c05-ad9c-de4bb9a6dbc3', '12d5f81e-d52b-4e8a-bd1d-64722f6f00dd', NULL, '2025-10-12 20:59:48.112', true, '2025-10-02 20:59:48.113', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('18419f36-cbdb-42f9-a31b-2d9de8a486f8', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '674c436c-6dd2-4880-9efd-0b6521930f05', NULL, '2025-09-27 00:00:00', true, '2025-10-02 21:15:27.481', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('c450b7a0-540f-4473-a48d-92aa3944bf6c', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'd4cc0a89-959d-4142-8e1e-00dab6aefe29', NULL, '2025-09-29 00:00:00', true, '2025-10-02 21:15:27.481', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('caa5fc52-d1f6-4de5-a8d0-e189af85ea09', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '3de1ca5f-1176-47bf-be8c-18009a769109', NULL, '2025-09-22 00:00:00', true, '2025-10-02 21:15:27.481', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('381d5535-2164-497f-8f9f-6e5ce2b55ea2', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', '0dc0813b-773e-45f8-8663-2674192e81e8', NULL, '2025-10-02 23:59:00', true, '2025-10-02 21:15:27.481', NULL, NULL);
INSERT INTO public."PrinterTaskSchedule" VALUES ('c044951a-7b15-4d84-8979-220e0b179192', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', 'e811a464-3b7b-44ca-8379-0e20884b0b66', NULL, '2025-10-02 23:59:00', true, '2025-10-02 21:15:27.481', NULL, NULL);


--
-- Data for Name: SMTPSettings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."SMTPSettings" VALUES ('0d0e3aea-2a6d-4a84-beac-af7598b56f22', 'smtp.gmail.com', 587, true, 'test@example.com', 'cbd59399e1a0020846569ab6510aff3e:d77c1ec7b6bb580c0823a92de6dfb3a2', 'Test Sender', 'test@example.com', '2025-10-02 23:31:25.795', '2025-10-02 22:20:14.509', '09:30');


--
-- Data for Name: TelegramSettings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TelegramSettings" VALUES ('249ec9fc-24a4-4df6-bab7-677f96e61104', 'c1185a689954310437705b4431c1ea7e:f5ab466a38e75c6b45dd047cb4983e2e15c107f62a566ee3e7d8d4528ece344050e41065a5c7a56d99ef618821c0ee6a', '123456789', true, false, false, '2025-10-02 23:42:21.533', '2025-10-02 22:37:19.479', '10:30');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('a6d1b301-fa89-4946-82d7-45630707e951', 'Operator User', 'operator@example.com', '$2b$10$Wg/deuBuG2RQ3tWCVJA76evkVc5SD4Pq0DktelzKHHLVqfcjAWNfK', 'OPERATOR', '5ae44222-94d3-4d04-8081-dc63afd54fa1', '2025-10-02 14:27:56.919', NULL);
INSERT INTO public."User" VALUES ('86f80287-7271-4711-85cb-41b75f9e5e3d', 'Admin User', 'admin@example.com', '$2b$10$Wg/deuBuG2RQ3tWCVJA76evkVc5SD4Pq0DktelzKHHLVqfcjAWNfK', 'ADMIN', '318a97d2-8425-4af8-b362-baa45dbb3d19', '2025-10-02 14:27:56.919', NULL);
INSERT INTO public."User" VALUES ('f1973da8-95ac-4bd4-96b4-14ebdcbc5574', 'Viewer User', 'viewer@example.com', '$2b$10$Wg/deuBuG2RQ3tWCVJA76evkVc5SD4Pq0DktelzKHHLVqfcjAWNfK', 'VIEWER', 'ef9fc579-6f09-44fe-ba29-9e355ed519f0', '2025-10-02 14:27:56.919', NULL);
INSERT INTO public."User" VALUES ('58cda310-56f7-4c9d-8e32-85fc18f513eb', 'Technician User', 'technician@example.com', '$2b$10$Wg/deuBuG2RQ3tWCVJA76evkVc5SD4Pq0DktelzKHHLVqfcjAWNfK', 'OPERATOR', '65ed7155-a23a-4887-b579-a450bba79845', '2025-10-02 14:27:56.919', NULL);
INSERT INTO public."User" VALUES ('363659c0-9038-4537-8602-4e16be4ccf47', 'Test User with Telegram', 'testuser@telegram.test', '$2b$10$w531CWB1wZlAyp1o58bk5eUYDxwIjgae8o.fM7vfIh9WzrIQiPy8O', 'VIEWER', NULL, '2025-10-02 22:55:17.651', '@updateduser');
INSERT INTO public."User" VALUES ('88b7c8aa-19b5-458f-b5e3-2a1e3255588e', 'Test User No Telegram', 'notelegram@example.test', '$2b$10$s6wuFNvym4fpD1nP8hdMc.bgI1osGnsetVL0mXCmW1Cg8zh/UI9PK', 'VIEWER', NULL, '2025-10-02 22:56:28.78', NULL);


--
-- Data for Name: WorkLog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."WorkLog" VALUES ('bcd9b4e1-6630-47d0-bf91-66fc74e78d69', '2025-10-02 23:03:02.521', 'ac335f81-81cd-4b16-b70f-45feb9c4f5f8', NULL, NULL, 1, 1, 'Routine maintenance completed.', 'Admin User', '2025-10-02 23:03:02.521', NULL, NULL, NULL);


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.session VALUES ('gTVNclbj9wUeL-r-uNYCgAeXGQp2VRVB', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T22:54:21.449Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 22:56:30');
INSERT INTO public.session VALUES ('amECef6Tq0GXCcRNj-_K9xRTldyNCR8p', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:06:53.649Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:42:55');
INSERT INTO public.session VALUES ('xJAzg1evKABmeKjBLd9XWr_TYDLTP1Nd', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:41:48.534Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:42:34');
INSERT INTO public.session VALUES ('EB1usoeJUoTik3uCLWeVAB-58siQBaU5', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T22:52:40.323Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 22:52:51');
INSERT INTO public.session VALUES ('65SStHSZZY46xiJPUE9vKC4klF1kSnnc', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:00:57.688Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:04:24');
INSERT INTO public.session VALUES ('lPyH1pCeezL5kwO9lPUCZ2kAZWa5_cjq', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:30:46.779Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:31:45');
INSERT INTO public.session VALUES ('tRbaaj1HsilI5mHsDS8Rm3wCa9z4MhcU', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:19:54.358Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:19:55');
INSERT INTO public.session VALUES ('ONTZ4VgvqILm1ryKaWi83QHGhsJEvqrp', '{"cookie":{"originalMaxAge":604800000,"expires":"2025-10-09T23:28:26.828Z","secure":false,"httpOnly":true,"path":"/"},"userId":"86f80287-7271-4711-85cb-41b75f9e5e3d","email":"admin@example.com","name":"Admin User","role":"ADMIN","groupId":"318a97d2-8425-4af8-b362-baa45dbb3d19"}', '2025-10-09 23:29:20');


--
-- PostgreSQL database dump complete
--

