INSERT IGNORE INTO priorities (name, color, level) VALUES ('Alta', 'RED', 2);
INSERT IGNORE INTO priorities (name, color, level) VALUES ('Media', 'YELLOW', 3);
INSERT IGNORE INTO priorities (name, color, level) VALUES ('Baja', 'ORANGE', 4);
INSERT IGNORE INTO priorities (name, color, level) VALUES ('Crítica', 'PURPLE', 1);


INSERT IGNORE INTO study_methods (id, name, method_type) VALUES (1, 'Método Pomodoro', 'POMODORO');


INSERT IGNORE INTO categories (id, name, description, order_tasks, image_id, user_id, study_method_id) VALUES
(5, 'Personal', 'Tareas personales', 'PRIORITY_ASC', 1, 1, null),
(2, 'Trabajo', 'Tareas laborales y profesionales', 'DUE_DATE', 2, 1, null),
(3, 'Universidad', 'Tareas académicas', 'DATE_CREATED', 1, 1, 1),
(4, 'Compras', 'Lista de compras pendientes', 'NAME_ASC', 1, 1, null);





