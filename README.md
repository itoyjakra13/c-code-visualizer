

<div align="center">

# C Code Visualizer

An interactive C programming visualizer that executes code step by step, allowing users to observe variables, memory, function calls, and program flow in real time.

Designed to simplify learning and debugging by making the internal execution of C programs easy to understand.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# Overview

C Code Visualizer is an educational web application that helps users understand how C programs execute internally.

Instead of displaying only the final output, the application executes programs one statement at a time while visualizing changes in variables, memory, stack frames, heap allocation, pointers, arrays, and function calls.

The project focuses on providing an intuitive learning experience for students while maintaining a modular architecture suitable for future expansion.

---

# Preview

<img width="1916" height="999" alt="image" src="https://github.com/user-attachments/assets/6dd817d7-56ac-481c-adc0-df07228f7230" />


# Features

* Interactive C code editor
* Step-by-step program execution
* Live execution timeline
* Variable inspection
* Stack visualization
* Heap visualization
* Pointer visualization
* Array visualization
* Function call stack
* Console input/output
* Runtime execution controls
* Breakpoints
* Adjustable execution speed
* Built-in example programs
* Beginner-friendly execution mode
* Responsive interface
* Dark and Light themes

---

# Technology Stack

| Category      | Technology        |
| ------------- | ----------------- |
| Framework     | React             |
| Language      | TypeScript        |
| Build Tool    | Vite              |
| Styling       | Tailwind CSS      |
| Code Editor   | Monaco Editor     |
| Animations    | Framer Motion     |
| Backend       | Node.js + Express |
| Compiler      | GCC / Clang       |
| Visualization | React Flow / SVG  |

---

# Folder Structure

```text
c-code-visualizer
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── context
│   │   ├── services
│   │   ├── utils
│   │   ├── assets
│   │   └── App.tsx
│   │
│   └── public
│
├── server
│   ├── api
│   ├── compiler
│   ├── parser
│   ├── execution-engine
│   ├── services
│   └── middleware
│
├── shared
├── docs
├── tests
├── package.json
└── README.md
```

---

# Installation

Clone the repository.

```bash
git clone https://github.com/yourusername/c-code-visualizer.git
```

Navigate to the project directory.

```bash
cd c-code-visualizer
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Create a production build.

```bash
npm run build
```

Preview the production build.

```bash
npm run preview
```

---

# Application Workflow

```text
C Source Code
      │
      ▼
Code Editor
      │
      ▼
Parser / Compiler
      │
      ▼
Execution Engine
      │
      ▼
Execution States
      │
      ▼
Visualization Engine
      │
      ▼
Interactive Debugger
```

---

# Design Goals

The project is built around the following principles:

* Modular architecture
* Separation of execution and visualization
* Component reusability
* Beginner-friendly interface
* Deterministic execution
* Responsive design
* Maintainable codebase
* Extensible architecture

---

# Browser Support

| Browser | Supported |
| ------- | --------- |
| Chrome  | ✔         |
| Edge    | ✔         |
| Firefox | ✔         |
| Brave   | ✔         |
| Opera   | ✔         |

---

# Current Limitations

* Supports a subset of C features during early development.
* Performance may vary for very large programs.
* Memory addresses are simulated for visualization.
* Advanced compiler optimizations are intentionally disabled.

---

# Planned Features

* Full pointer analysis
* Dynamic memory tracking
* Recursion visualization
* Structure and union visualization
* Linked List animations
* Tree and Graph visualization
* Sorting algorithm animations
* Search algorithm visualization
* Execution history export
* Session sharing
* Quiz mode
* Classroom mode
* Multi-file C projects

---

# Development Notes

The application is designed as a learning tool rather than a replacement for traditional debuggers.

The execution engine records program state after each executed statement, allowing users to navigate both forwards and backwards through execution without rerunning the program.

The architecture separates parsing, execution, and visualization into independent modules to simplify maintenance and future development.

---

# Contributing

Contributions are welcome.

If you encounter a bug, have suggestions for improvements, or would like to add new features, feel free to open an issue or submit a pull request.

---

# Author

**Arkajyoti Rakshit**

Bachelor of Technology
Computer Science & Engineering

GitHub: https://github.com/itoyjakra13

---

# License

This project is licensed under the MIT License.
