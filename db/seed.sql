USE tet_db;

INSERT INTO department (name)
VALUES ("Human Resources"),
       ("Application Development"),
       ("Application Services"),
       ("Service Delivery"),
       ("End User Services"),
       ("Networking"),
       ("Infastructure");

INSERT INTO roles (title, salary, department_id)
VALUES ("Human Resource Manager", 200000, 1),
       ("Human Resource Generalist", 100000, 1),
       ("Human Resource BP", 150000, 1),

       ("Application Dev Manager", 200000, 2),
       ("Application Developer", 100000, 2),
       ("Senior Application Developer", 150000, 2),

       ("Application Services Manager", 200000, 3),
       ("Release Engineer", 125000, 3),
       ("Automation Engineer", 150000, 3),
       ("DevOps Engineer", 100000, 3),
       
       ("Service Delivery Manager", 200000, 4),
       ("Delivery Engineer", 125000, 4),

       ("End User Services Manager", 200000, 5),
       ("Service Tech", 125000, 5),
       ("Senior Tech", 150000, 5),

       ("Networking Manager", 200000, 6),
       ("Networking Tech", 125000, 6),

       ("Infastructure Manager", 200000, 7),
       ("Infastructure Tech", 125000, 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Christian", "Horner", 1, 0),
("Sergio", "Perez", 2, 1),
("Lewis", "Hamilton", 5, 4),
("Toto", "Wolff", 4, 0),
("George", "Russel", 6, 4),
("Sebastian", "Vettle", 8, 8),
("Max", "Verstappen", 3, 1),
("Mike", "Krack", 7, 0),
("Lance", "Stroll", 9, 8)