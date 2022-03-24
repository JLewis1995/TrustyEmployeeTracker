const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "tet_db",
  },
  console.log(`connected to the database`)
);

// creating constant that contains initial questions for user
const mainOptionList = [
  {
    type: "list",
    message: "Select from the options below",
    pageSize: 5,
    choices: [
      "View all Departments",
      "View all Roles",
      "View all Employees",
      "Add a Department",
      "Add a Role",
      "Add an Employee",
      "Update an Employee Role",
      "Exit",
    ],
    name: "choice",
  },
];

// init function to prompt user for response
function init() {
  inquirer.prompt(mainOptionList).then(function (res) {
    if (res.choice == "View all Departments") {
      getDepartments();
    } else if (res.choice == "View all Roles") {
      getRoles();
    } else if (res.choice == "View all Employees") {
      getEmployees();
    } else if (res.choice == "Add a Department") {
      addDepartment();
    } else if (res.choice == "Add a Role") {
      addRole();
    } else if (res.choice == "Add an Employee") {
      addEmployee();
    } else if (res.choice == "Update an Employee Role") {
      updateEmployee();
    } else if (res.choice == "Exit") {
      console.log(`Goodbye!`);
      end();
    }
  });
}

function getDepartments() {
  db.query(`SELECT * FROM department;`, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log(`department output:`);
    console.table(res);
    init();
  });
}

function getRoles() {
  db.query(`SELECT * FROM roles;`, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log(`role output:`);
    console.table(res);
    init();
  });
}

function getEmployees() {
  // query to get all necessary data to create table with employee relevant data - gathering from multiple tabless by using tablename.fieldname
  db.query(
    `SELECT employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, department.name AS department, employee.manager_id FROM employee JOIN roles ON roles.id = employee.role_id JOIN department on roles.department_id = department.id ORDER BY employee.id`,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      // for loop to change Manager Id to Manger Name
      for (let i = 0; i < res.length; i++) {
        if (res[i].manager_id == 0) {
          res[i].managerName = "No Manager";
        } else {
          // count starts at 0, mysql db starts at 1 - adjusting
          let managersID = res[i].manager_id - 1;
          // creating variable for the managers name
          let name = `${res[managersID].first_name} ${res[managersID].last_name}`;
          res[i].managerName = name;
        }
        // removing Id as it is no longer relevant
        delete res[i].manager_id;
      }
      console.table(res);
      init();
    }
  );
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department you would like to add?",
        name: "deptName",
      },
    ])
    .then(function (res) {
      const sql = `INSERT INTO department (name) 
      VALUES (?);`;
      const params = res.deptName;
      db.query(sql, params, (err, res) => {
        if (err) {
          console.log(err);
          return;
        }
        // show updated department list with user input included
        getDepartments();
      });
    });
}

function addEmployee() {
  // query roles for titles - will need later
  db.query(`SELECT title FROM roles;`, (err, res) => {
    if (err) {
      console.log(err);
    }
    let currentRoles = res;

    // query employee for first and last names - save for use
    db.query(
      `SELECT employee.first_name, employee.last_name FROM employee;`,
      (err, res) => {
        if (err) {
          console.log(err);
        }
        let employees = res;

        inquirer
          .prompt([
            {
              type: "input",
              message: "What is the employee's first name?",
              name: "firstName",
            },
            {
              type: "input",
              message: "What is the employee's last name?",
              name: "lastName",
            },

            {
              type: "list",
              message: "What is their role?",
              name: "roleName",
              // use query to roles to display list of roles to choose from to ensure consistancy and connection
              choices: () => {
                let role = [];
                for (let i = 0; i < currentRoles.length; i++) {
                  const curID = i + 1;
                  let curTitle = currentRoles[i].title;
                  role.push(`${curID}: ${curTitle}`);
                }
                return role;
              },
            },
            {
              type: "list",
              message: "Who is there manager?",
              name: "mgrName",
              // use query to employee to display list of employees to choose from to ensure consistancy and connection
              choices: () => {
                let mgrs = [];
                for (let i = 0; i < employees.length; i++) {
                  let mgrID = i + 1;
                  let first = employees[i].first_name;
                  let last = employees[i].last_name;
                  mgrs.push(`${mgrID}: ${first} ${last}`);
                }
                mgrs.push(`0: No Manager`);
                return mgrs;
              },
            },
          ])
          .then(function (res) {
            // create variables to pass into query from user input
            let firstName = res.firstName;
            let lastName = res.lastName;
            // use parse int to gather curID - ensures we update the right sql field
            let roleId = parseInt(res.roleName.split(":")[0]);
            let mgrId = parseInt(res.mgrName.split(":")[0]);
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
      VALUES ("${firstName}", "${lastName}", ${roleId}, ${mgrId});`;
            db.query(sql, (err, res) => {
              if (err) {
                console.log(err);
                return;
              }
              // show updated employee list with user input included
              getEmployees();
            });
          });
      }
    );
  });
}

function addRole() {
  // query departments and save those for later.
  db.query(`SELECT department.name FROM department;`, (err, res) => {
    if (err) {
      console.log(err);
    }
    let depts = res;
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the title of the role you would like to add?",
          name: "title",
        },
        {
          type: "input",
          message: "What is the salaray for this role? (no decimals please)",
          name: "salary",
        },
        {
          type: "list",
          message: "Please choose the department this role is in:",
          name: "deptPick",
          // use query to department to display list of deparments to choose from to ensure consistancy and connection
          choices: () => {
            let department = [];
            for (let i = 0; i < depts.length; i++) {
              let curID = i + 1;
              let curDept = depts[i].name;
              department.push(`${curID}: ${curDept}`);
            }
            return department;
          },
        },
      ])
      .then(function (res) {
        // create variables for create/insert query
        let title = res.title;
        let salary = res.salary;
        // use parse int to gather curID - ensures we update the right sql field
        let department = parseInt(res.deptPick.split(":")[0]);
        console.log(title);
        console.log(department);
        const sql = `INSERT INTO roles (title, salary, department_id) 
      VALUES ("${title}", ${salary}, ${department});`;
        db.query(sql, (err, res) => {
          if (err) {
            console.log(err);
            return;
          }
          // show list of roles with user input included
          getRoles();
        });
      });
  });
}

function updateEmployee() {
  // query employees names and id and save for later use
  db.query(
    `SELECT employee.first_name, employee.last_name, employee.role_id FROM employee;`,
    (err, res) => {
      if (err) {
        console.log(err);
      }
      let employees = res;
      // query roles for title and save for later use
      db.query(`SELECT title FROM roles;`, (err, res) => {
        if (err) {
          console.log(err);
        }
        let currentRoles = res;

        inquirer
          .prompt([
            {
              type: "list",
              message: "Please choose an employee to update:",
              name: "employee",
              // use query to employee to display list of employees to choose from to ensure we update current item in database
              choices: () => {
                let employee = [];
                for (let i = 0; i < employees.length; i++) {
                  let curID = i + 1;
                  let first = employees[i].first_name;
                  let last = employees[i].last_name;
                  let currentRoleID = employees[i].role_id;
                  employee.push(
                    `${curID}: ${first} ${last} - current role is #${currentRoleID}`
                  );
                }
                return employee;
              },
            },
            {
              type: "list",
              message: "Please choose their new role",
              name: "newRole",
              // use query to roles to display list of roles to choose from to ensure consistancy and connection
              choices: () => {
                let role = [];
                for (let i = 0; i < currentRoles.length; i++) {
                  const curID = i + 1;
                  let curTitle = currentRoles[i].title;
                  role.push(`${curID}: ${curTitle}`);
                }
                return role;
              },
            },
          ])
          .then(function (res) {
            // use parse int to gather curID - ensures we update the right sql field
            let id = parseInt(res.employee.split(":")[0]);
            let newRole = parseInt(res.newRole.split(":")[0]);
            const sql = `UPDATE employee SET role_id = ${newRole} WHERE id = ${id}`;
            db.query(sql, (err, result) => {
              if (err) {
                console.log(err);
                return;
              }
              // show updated list of employees with user input updated in database
              getEmployees();
            });
          });
      });
    }
  );
}

function end() {
  db.end();
  console.log(`disconnected`);
}

app.listen(PORT);

init();