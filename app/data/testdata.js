export const htmlTestQuestions = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Making Language"
    ],
    answer: "HyperText Markup Language",
    explanation: "HTML stands for HyperText Markup Language, used to structure the content of web pages."
  },
  {
    id: 2,
    question: "Which tag is used to create a hyperlink?",
    options: ["<a>", "<link>", "<href>", "<url>"],
    answer: "<a>",
    explanation: "The <a> tag defines a hyperlink that links one page to another using the href attribute."
  },
  {
    id: 3,
    question: "What is the correct HTML element for inserting a line break?",
    options: ["<break>", "<lb>", "<br>", "<line>"],
    answer: "<br>",
    explanation: "The <br> tag inserts a single line break and does not require a closing tag."
  },
  {
    id: 4,
    question: "Difference between <div> and <span> tags?",
    options: [
      "<div> is block-level, <span> is inline",
      "<div> is inline, <span> is block-level",
      "Both are inline elements",
      "Both are block-level elements"
    ],
    answer: "<div> is block-level, <span> is inline",
    explanation: "<div> is a block-level element used for grouping sections, while <span> is inline, used for styling parts of text."
  },
  {
    id: 5,
    question: "Which tag is used to display an image in HTML?",
    options: ["<src>", "<image>", "<img>", "<pic>"],
    answer: "<img>",
    explanation: "The <img> tag embeds an image in an HTML page using the 'src' attribute for the image path."
  },
  {
    id: 6,
    question: "What is the purpose of the alt attribute in the <img> tag?",
    options: [
      "It defines image alignment",
      "It provides alternative text if the image fails to load",
      "It changes the image size",
      "It adds a border around the image"
    ],
    answer: "It provides alternative text if the image fails to load",
    explanation: "The 'alt' attribute specifies alternative text for accessibility and when the image cannot be displayed."
  },
  {
    id: 7,
    question: "How can you create an ordered list?",
    options: ["<ul>", "<ol>", "<list>", "<order>"],
    answer: "<ol>",
    explanation: "The <ol> tag defines an ordered list, which displays items in a numbered format."
  },
  {
    id: 8,
    question: "What is the purpose of the <head> element?",
    options: [
      "It defines the main content of the page",
      "It stores metadata and links to scripts, styles, and titles",
      "It displays visible headings",
      "It contains navigation elements"
    ],
    answer: "It stores metadata and links to scripts, styles, and titles",
    explanation: "The <head> element contains metadata like the title, styles, scripts, and SEO-related tags."
  },
  {
    id: 9,
    question: "How do you make a checkbox in HTML?",
    options: [
      "<input type='button'>",
      "<input type='checkbox'>",
      "<checkbox>",
      "<check>"
    ],
    answer: "<input type='checkbox'>",
    explanation: "You create a checkbox using the <input> tag with the type attribute set to 'checkbox'."
  },
  {
    id: 10,
    question: "What is the semantic meaning of <article> and <section>?",
    options: [
      "<article> represents independent content, <section> groups related content",
      "<article> is for navigation, <section> for articles",
      "Both have the same meaning",
      "<section> represents independent content, <article> groups related content"
    ],
    answer: "<article> represents independent content, <section> groups related content",
    explanation: "The <article> tag defines self-contained content, while <section> groups related content within a page."
  }
];
export const cssTestQuestions = [
  {
    id: 1,
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Colorful Style Syntax",
      "Computer Styled Sections",
      "Creative Style System"
    ],
    answer: "Cascading Style Sheets",
    explanation: "CSS stands for Cascading Style Sheets, which is used to style and layout HTML elements."
  },
  {
    id: 2,
    question: "How do you link a CSS file to an HTML file?",
    options: [
      "<style src='style.css'>",
      "<link rel='stylesheet' href='style.css'>",
      "<css link='style.css'>",
      "<stylesheet>style.css</stylesheet>"
    ],
    answer: "<link rel='stylesheet' href='style.css'>",
    explanation: "You link a CSS file using the <link> tag inside the <head> section of your HTML document."
  },
  {
    id: 3,
    question: "What is the difference between id and class selectors?",
    options: [
      "An id is used for multiple elements, class for one element",
      "An id is unique for one element, class can be used for multiple elements",
      "Both are the same",
      "Id is used for styling text only"
    ],
    answer: "An id is unique for one element, class can be used for multiple elements",
    explanation: "The id selector targets a single unique element using #, while the class selector targets multiple elements using ."
  },
  {
    id: 4,
    question: "What is the purpose of the z-index property?",
    options: [
      "To control text color",
      "To control the stacking order of elements",
      "To change the opacity of elements",
      "To set element dimensions"
    ],
    answer: "To control the stacking order of elements",
    explanation: "The z-index property determines which elements appear on top when elements overlap."
  },
  {
    id: 5,
    question: "Explain the difference between relative, absolute, and fixed positioning.",
    options: [
      "Relative positions elements based on the viewport; absolute based on the parent; fixed moves freely",
      "Relative moves relative to its normal position; absolute is positioned relative to its nearest positioned ancestor; fixed is relative to the viewport",
      "All behave the same",
      "Relative means static; fixed means absolute"
    ],
    answer: "Relative moves relative to its normal position; absolute is positioned relative to its nearest positioned ancestor; fixed is relative to the viewport",
    explanation: "Relative keeps element flow but moves it slightly; absolute removes it from flow; fixed sticks it to a specific viewport position."
  },
  {
    id: 6,
    question: "What does flexbox help you do?",
    options: [
      "Create flexible and responsive layouts easily",
      "Draw shapes in CSS",
      "Apply shadows to text",
      "Change colors dynamically"
    ],
    answer: "Create flexible and responsive layouts easily",
    explanation: "Flexbox (Flexible Box Layout) helps align, distribute, and arrange elements dynamically in containers."
  },
  {
    id: 7,
    question: "How do you make text bold using CSS?",
    options: [
      "font-weight: bold;",
      "text-bold: true;",
      "font-style: bold;",
      "text-weight: strong;"
    ],
    answer: "font-weight: bold;",
    explanation: "You use the CSS property 'font-weight' and set it to 'bold' to make text bold."
  },
  {
    id: 8,
    question: "What is the purpose of media queries?",
    options: [
      "To create animations",
      "To make websites responsive by applying styles based on screen size",
      "To add hover effects",
      "To load multiple CSS files"
    ],
    answer: "To make websites responsive by applying styles based on screen size",
    explanation: "Media queries allow you to apply CSS rules conditionally based on device width, height, or orientation for responsive design."
  },
  {
    id: 9,
    question: "What is the difference between padding and margin?",
    options: [
      "Padding is space outside the element, margin is inside",
      "Padding is space inside the element, margin is outside",
      "They are the same",
      "Padding only applies to text"
    ],
    answer: "Padding is space inside the element, margin is outside",
    explanation: "Padding creates space between the content and border, while margin creates space outside the element’s border."
  },
  {
    id: 10,
    question: "How do you center an element horizontally using CSS Flexbox?",
    options: [
      "justify-content: center;",
      "align-items: center;",
      "margin: auto;",
      "display: block;"
    ],
    answer: "justify-content: center;",
    explanation: "In a flex container, 'justify-content: center;' centers items horizontally along the main axis."
  }
];
export const jsTestQuestions = [
  {
    id: 1,
    question: "What are the differences between var, let, and const?",
    options: [
      "var is block-scoped, let and const are function-scoped",
      "var is function-scoped, let and const are block-scoped",
      "All three are block-scoped",
      "let and const are function-scoped, var is block-scoped"
    ],
    answer: "var is function-scoped, let and const are block-scoped",
    explanation: "In JavaScript, 'var' is function-scoped and can be redeclared, while 'let' and 'const' are block-scoped. 'const' cannot be reassigned."
  },
  {
    id: 2,
    question: "What is a callback function?",
    options: [
      "A function that is called at the beginning of a program",
      "A function passed as an argument to another function to be executed later",
      "A function that runs automatically after a loop",
      "A function that calls itself recursively"
    ],
    answer: "A function passed as an argument to another function to be executed later",
    explanation: "A callback function is passed into another function and executed after an operation is completed, commonly used in asynchronous programming."
  },
  {
    id: 3,
    question: "What is the output of typeof null in JavaScript?",
    options: ["'null'", "'object'", "'undefined'", "'number'"],
    answer: "'object'",
    explanation: "The expression typeof null returns 'object' — this is a long-standing bug in JavaScript for backward compatibility."
  },
  {
    id: 4,
    question: "What is the purpose of 'use strict'?",
    options: [
      "To allow undeclared variables",
      "To enforce stricter parsing and error handling in JavaScript code",
      "To enable modern ECMAScript features",
      "To disable console logs"
    ],
    answer: "To enforce stricter parsing and error handling in JavaScript code",
    explanation: "'use strict' enables strict mode, which catches common coding mistakes and prevents the use of undeclared variables."
  },
  {
    id: 5,
    question: "What are arrow functions and how do they differ from regular functions?",
    options: [
      "They have their own 'this' and use the 'function' keyword",
      "They do not have their own 'this' and use shorter syntax",
      "They are used only for constructors",
      "They are slower than regular functions"
    ],
    answer: "They do not have their own 'this' and use shorter syntax",
    explanation: "Arrow functions provide a concise syntax and lexically bind 'this' from their surrounding scope instead of creating a new one."
  },
  {
    id: 6,
    question: "What is the difference between == and ===?",
    options: [
      "== compares both value and type, === compares only value",
      "== compares only value, === compares both value and type",
      "Both are identical operators",
      "=== is used only in loops"
    ],
    answer: "== compares only value, === compares both value and type",
    explanation: "'==' performs type coercion before comparison, while '===' (strict equality) checks both value and data type without conversion."
  },
  {
    id: 7,
    question: "How do you handle asynchronous code in JavaScript?",
    options: [
      "Using callbacks, promises, or async/await",
      "Using loops and conditions",
      "By blocking the main thread",
      "Using global variables"
    ],
    answer: "Using callbacks, promises, or async/await",
    explanation: "Asynchronous code is managed through callbacks, promises, or the modern async/await syntax to avoid blocking the main thread."
  },
  {
    id: 8,
    question: "What is a higher-order function?",
    options: [
      "A function that returns another function or takes a function as an argument",
      "A function that runs faster than normal functions",
      "A built-in JavaScript method",
      "A function that executes only once"
    ],
    answer: "A function that returns another function or takes a function as an argument",
    explanation: "Higher-order functions operate on other functions — they can take them as arguments or return them. Examples include map(), filter(), and reduce()."
  },
  {
    id: 9,
    question: "What does the 'this' keyword refer to?",
    options: [
      "The current function",
      "The parent object of the current execution context",
      "Always the global object",
      "A variable holding function arguments"
    ],
    answer: "The parent object of the current execution context",
    explanation: "'this' refers to the object that owns the function being executed. Its value depends on how and where the function is called."
  },
  {
    id: 10,
    question: "What is a Promise in JavaScript?",
    options: [
      "A synchronous function that guarantees an output",
      "An object representing the eventual completion or failure of an asynchronous operation",
      "A debugging tool for errors",
      "A method for looping asynchronously"
    ],
    answer: "An object representing the eventual completion or failure of an asynchronous operation",
    explanation: "A Promise is an object that represents the result of an asynchronous task. It can be in one of three states: pending, fulfilled, or rejected."
  }
];
export const reactTestQuestions = [
  {
    id: 1,
    question: "What is React and why is it used?",
    options: [
      "A backend framework for APIs",
      "A JavaScript library for building user interfaces",
      "A CSS preprocessor",
      "A database management system"
    ],
    answer: "A JavaScript library for building user interfaces",
    explanation: "React is a JavaScript library developed by Facebook for building fast, reusable, and component-based user interfaces."
  },
  {
    id: 2,
    question: "What are functional components in React?",
    options: [
      "Components written using ES6 classes",
      "Components that are written as JavaScript functions and return JSX",
      "Components that handle database operations",
      "Components that are not reusable"
    ],
    answer: "Components that are written as JavaScript functions and return JSX",
    explanation: "Functional components are simple functions that return JSX and can use React hooks for state and side effects."
  },
  {
    id: 3,
    question: "What is JSX and why do we use it?",
    options: [
      "A syntax extension that allows writing HTML inside JavaScript",
      "A templating engine for backend rendering",
      "A CSS-in-JS library",
      "A JavaScript compiler"
    ],
    answer: "A syntax extension that allows writing HTML inside JavaScript",
    explanation: "JSX (JavaScript XML) allows developers to write HTML-like code inside JavaScript, making the UI code easier to understand and maintain."
  },
  {
    id: 4,
    question: "What is the difference between state and props?",
    options: [
      "State is read-only, props are mutable",
      "Props are used for local data, state for parent data",
      "State is internal to a component, props are external data passed from parent",
      "They are the same in React"
    ],
    answer: "State is internal to a component, props are external data passed from parent",
    explanation: "State is managed within a component and can change over time, while props are immutable data passed down from parent components."
  },
  {
    id: 5,
    question: "What does the useEffect hook do?",
    options: [
      "Handles user input events",
      "Performs side effects in functional components",
      "Declares a new state variable",
      "Renders elements conditionally"
    ],
    answer: "Performs side effects in functional components",
    explanation: "The useEffect hook allows you to perform side effects such as fetching data, updating the DOM, or setting up subscriptions in React."
  },
  {
    id: 6,
    question: "What is the purpose of keys in React lists?",
    options: [
      "They define the style of list items",
      "They help React identify which items have changed, been added, or removed",
      "They are used to control animations",
      "They improve security of lists"
    ],
    answer: "They help React identify which items have changed, been added, or removed",
    explanation: "Keys give elements a stable identity, helping React optimize re-rendering when lists are updated."
  },
  {
    id: 7,
    question: "What are controlled and uncontrolled components?",
    options: [
      "Controlled components manage form data through React state, uncontrolled use the DOM directly",
      "Uncontrolled components are faster than controlled ones",
      "Controlled components use CSS, uncontrolled do not",
      "They both mean the same thing"
    ],
    answer: "Controlled components manage form data through React state, uncontrolled use the DOM directly",
    explanation: "Controlled components rely on React state to handle form inputs, while uncontrolled components use refs to access values directly from the DOM."
  },
  {
    id: 8,
    question: "What is the Context API used for?",
    options: [
      "To handle asynchronous requests",
      "To manage global state and pass data without props drilling",
      "To manage routing in React apps",
      "To create custom hooks"
    ],
    answer: "To manage global state and pass data without props drilling",
    explanation: "The Context API provides a way to share values like themes or user data between components without passing props manually through each level."
  },
  {
    id: 9,
    question: "How do you handle events in React?",
    options: [
      "By using lowercase event names like 'onclick'",
      "By using camelCase event handlers like onClick and passing functions",
      "By writing inline JavaScript in HTML tags",
      "By declaring events in the backend"
    ],
    answer: "By using camelCase event handlers like onClick and passing functions",
    explanation: "React handles events using camelCase syntax (e.g., onClick, onChange) and functions are passed as event handlers instead of strings."
  },
  {
    id: 10,
    question: "What is the purpose of React.memo()?",
    options: [
      "To create custom hooks",
      "To prevent unnecessary re-renders of functional components",
      "To convert a class component into a function component",
      "To memoize state variables"
    ],
    answer: "To prevent unnecessary re-renders of functional components",
    explanation: "React.memo() is a higher-order component that memoizes a component’s output, re-rendering it only if its props change."
  }
];
export const nextjsTestQuestions = [
  {
    id: 1,
    question: "What is the difference between Next.js and React?",
    options: [
      "Next.js is a backend framework, React is a database",
      "React is a UI library, Next.js is a React framework with routing and SSR support",
      "Both are the same thing",
      "Next.js is for mobile apps, React is for web apps"
    ],
    answer: "React is a UI library, Next.js is a React framework with routing and SSR support",
    explanation: "Next.js extends React by adding server-side rendering, static site generation, file-based routing, and optimized performance features."
  },
  {
    id: 2,
    question: "What is server-side rendering (SSR)?",
    options: [
      "Rendering components in the browser after fetching data",
      "Rendering HTML on the server before sending it to the client",
      "Storing data on the server",
      "Compiling JavaScript into server files"
    ],
    answer: "Rendering HTML on the server before sending it to the client",
    explanation: "SSR allows pages to be rendered on the server, improving performance and SEO by delivering pre-rendered HTML to users."
  },
  {
    id: 3,
    question: "How do you create dynamic routes in Next.js?",
    options: [
      "By using useRouter inside any component",
      "By creating files with brackets like [id].js in the pages directory",
      "By using the useState hook",
      "By writing routes manually in a config file"
    ],
    answer: "By creating files with brackets like [id].js in the pages directory",
    explanation: "Dynamic routes in Next.js are created using bracket syntax (e.g., [id].js), allowing URL parameters to map to pages automatically."
  },
  {
    id: 4,
    question: "What is getStaticProps used for?",
    options: [
      "To fetch data at runtime for every request",
      "To fetch data at build time for static generation",
      "To handle client-side routing",
      "To update components dynamically"
    ],
    answer: "To fetch data at build time for static generation",
    explanation: "getStaticProps runs at build time to fetch data and generate static HTML files for better performance and caching."
  },
  {
    id: 5,
    question: "What is Incremental Static Regeneration (ISR)?",
    options: [
      "A method for rebuilding static pages after deployment",
      "A caching system for APIs",
      "A React hook for server rendering",
      "A router optimization method"
    ],
    answer: "A method for rebuilding static pages after deployment",
    explanation: "ISR allows static pages to be updated in the background without rebuilding the entire site, combining static and dynamic benefits."
  },
  {
    id: 6,
    question: "How do you handle API routes in Next.js?",
    options: [
      "By using Express.js inside the project",
      "By creating files in the pages/api directory",
      "By adding endpoints in the next.config.js file",
      "By writing backend code in _app.js"
    ],
    answer: "By creating files in the pages/api directory",
    explanation: "Next.js lets you define API endpoints as functions inside pages/api/, providing a simple built-in backend for your app."
  },
  {
    id: 7,
    question: "What is the purpose of next/image?",
    options: [
      "To upload images to the server",
      "To optimize and serve responsive images efficiently",
      "To convert images into base64",
      "To style images with CSS"
    ],
    answer: "To optimize and serve responsive images efficiently",
    explanation: "The next/image component automatically optimizes images for size, format, and responsiveness to improve performance."
  },
  {
    id: 8,
    question: "How do you deploy a Next.js app?",
    options: [
      "By running npm deploy",
      "Using platforms like Vercel, Netlify, or manually on any Node.js server",
      "By converting it into a React app",
      "By uploading it to GitHub only"
    ],
    answer: "Using platforms like Vercel, Netlify, or manually on any Node.js server",
    explanation: "Next.js apps can be deployed easily on Vercel (its official host) or other Node-compatible platforms."
  },
  {
    id: 9,
    question: "What is the use of Link component in Next.js?",
    options: [
      "To handle navigation between pages without full page reloads",
      "To connect to external APIs",
      "To load scripts dynamically",
      "To handle file uploads"
    ],
    answer: "To handle navigation between pages without full page reloads",
    explanation: "The Link component enables client-side navigation, improving performance by avoiding full page reloads."
  },
  {
    id: 10,
    question: "How do environment variables work in Next.js?",
    options: [
      "They are written directly in JavaScript files",
      "They are defined in .env files and accessed using process.env",
      "They can only be set in next.config.js",
      "They require a third-party package to use"
    ],
    answer: "They are defined in .env files and accessed using process.env",
    explanation: "Next.js supports environment variables via .env files. Variables prefixed with NEXT_PUBLIC_ are exposed to the browser."
  }
];
export const nodejsTestQuestions = [
  {
    id: 1,
    question: "What is Node.js and how is it different from JavaScript in the browser?",
    options: [
      "Node.js is a frontend framework for building UI",
      "Node.js runs JavaScript on the server, while browsers run it on the client side",
      "Node.js is a database system",
      "There is no difference; both are the same"
    ],
    answer: "Node.js runs JavaScript on the server, while browsers run it on the client side",
    explanation: "Node.js is a runtime environment that allows JavaScript to run on the server using the V8 engine, enabling backend development with JavaScript."
  },
  {
    id: 2,
    question: "What is the purpose of the event loop?",
    options: [
      "To block code execution until a task is complete",
      "To handle asynchronous operations without blocking the main thread",
      "To execute synchronous code only",
      "To manage database connections"
    ],
    answer: "To handle asynchronous operations without blocking the main thread",
    explanation: "The event loop continuously checks for pending tasks, callbacks, and I/O operations, enabling non-blocking and efficient execution in Node.js."
  },
  {
    id: 3,
    question: "How do you import built-in modules in Node.js?",
    options: [
      "By using the require() function",
      "By using importScripts()",
      "By linking them in HTML",
      "By writing them manually in the code"
    ],
    answer: "By using the require() function",
    explanation: "In CommonJS syntax, Node.js uses require() to import built-in or custom modules, such as const fs = require('fs')."
  },
  {
    id: 4,
    question: "What is the use of package.json?",
    options: [
      "To store frontend HTML and CSS files",
      "To keep metadata about the project and manage dependencies",
      "To configure the operating system",
      "To define user authentication data"
    ],
    answer: "To keep metadata about the project and manage dependencies",
    explanation: "package.json contains project information like name, version, dependencies, and scripts — it acts as the configuration file for Node.js projects."
  },
  {
    id: 5,
    question: "What is npm?",
    options: [
      "A programming language",
      "A package manager for Node.js that helps install and manage libraries",
      "A Node.js debugging tool",
      "A runtime environment"
    ],
    answer: "A package manager for Node.js that helps install and manage libraries",
    explanation: "npm (Node Package Manager) is the default package manager for Node.js used to install, update, and manage project dependencies."
  },
  {
    id: 6,
    question: "What are streams in Node.js?",
    options: [
      "Data structures for arrays",
      "Objects used to read or write data sequentially and efficiently",
      "Functions used to handle promises",
      "Network connections"
    ],
    answer: "Objects used to read or write data sequentially and efficiently",
    explanation: "Streams are objects that allow reading or writing data in chunks, making them ideal for handling large files or real-time data."
  },
  {
    id: 7,
    question: "What is the difference between synchronous and asynchronous code?",
    options: [
      "Synchronous code runs concurrently, asynchronous runs sequentially",
      "Synchronous code blocks execution, asynchronous allows non-blocking execution",
      "Both execute at the same time",
      "Synchronous code is faster than asynchronous"
    ],
    answer: "Synchronous code blocks execution, asynchronous allows non-blocking execution",
    explanation: "In Node.js, synchronous code executes line by line and blocks further execution, while asynchronous code continues running without waiting for tasks to complete."
  },
  {
    id: 8,
    question: "What does __dirname represent?",
    options: [
      "The name of the current file",
      "The absolute path of the directory containing the current file",
      "The Node.js version name",
      "The user's system directory"
    ],
    answer: "The absolute path of the directory containing the current file",
    explanation: "__dirname is a global variable in Node.js that provides the absolute path of the directory where the current script resides."
  },
  {
    id: 9,
    question: "How do you create a simple HTTP server in Node.js?",
    options: [
      "By using the fs module",
      "By importing the http module and using http.createServer()",
      "By creating a new HTML file",
      "By using a database connection"
    ],
    answer: "By importing the http module and using http.createServer()",
    explanation: "A basic HTTP server can be created using the built-in http module: const http = require('http'); const server = http.createServer((req,res)=>{res.end('Hello World');});"
  },
  {
    id: 10,
    question: "What is a callback function in Node.js?",
    options: [
      "A function that is called immediately after declaration",
      "A function passed as an argument to be executed later after an operation completes",
      "A function that blocks execution",
      "A function that runs only once during startup"
    ],
    answer: "A function passed as an argument to be executed later after an operation completes",
    explanation: "Callback functions allow asynchronous operations to run by executing a function after a task (like file read or API call) finishes."
  }
];
export const expressTestQuestions = [
  {
    id: 1,
    question: "What is Express.js used for?",
    options: [
      "To manage databases",
      "To build and manage server-side web applications using Node.js",
      "To design frontend interfaces",
      "To compile JavaScript into machine code"
    ],
    answer: "To build and manage server-side web applications using Node.js",
    explanation: "Express.js is a minimal and flexible Node.js web framework that provides tools for building APIs and web applications efficiently."
  },
  {
    id: 2,
    question: "How do you install Express in a project?",
    options: [
      "Using the command npm install express",
      "Using the command install express globally",
      "By downloading it manually from the browser",
      "By importing it from the frontend"
    ],
    answer: "Using the command npm install express",
    explanation: "You can install Express locally in your Node.js project using npm install express, which adds it to the project dependencies."
  },
  {
    id: 3,
    question: "What is middleware in Express?",
    options: [
      "A function that handles requests and responses before reaching the route handler",
      "A library used for database operations",
      "A frontend styling library",
      "A built-in debugging tool"
    ],
    answer: "A function that handles requests and responses before reaching the route handler",
    explanation: "Middleware functions process incoming requests, perform actions like logging or authentication, and either end the request or pass it to the next function."
  },
  {
    id: 4,
    question: "How do you handle routes in Express?",
    options: [
      "Using the app.route() method",
      "By defining routes with methods like app.get(), app.post(), etc.",
      "By creating routes in HTML files",
      "By importing routes from React components"
    ],
    answer: "By defining routes with methods like app.get(), app.post(), etc.",
    explanation: "Express allows defining routes using HTTP methods such as app.get('/path', callback) and app.post('/path', callback)."
  },
  {
    id: 5,
    question: "What is express.json() used for?",
    options: [
      "To parse incoming JSON request bodies",
      "To convert HTML to JSON",
      "To send responses to the browser",
      "To compress response data"
    ],
    answer: "To parse incoming JSON request bodies",
    explanation: "The express.json() middleware automatically parses incoming JSON data in requests, making it accessible through req.body."
  },
  {
    id: 6,
    question: "How do you send a JSON response?",
    options: [
      "Using res.text()",
      "Using res.json()",
      "Using res.sendFile()",
      "Using res.html()"
    ],
    answer: "Using res.json()",
    explanation: "In Express, res.json() sends a JSON-formatted response to the client, automatically setting the Content-Type header."
  },
  {
    id: 7,
    question: "What is the difference between req.params and req.query?",
    options: [
      "req.params is used for query strings, req.query is for URL parameters",
      "req.params is for route parameters, req.query is for query strings in the URL",
      "Both are the same in Express",
      "req.params is used for form data only"
    ],
    answer: "req.params is for route parameters, req.query is for query strings in the URL",
    explanation: "req.params captures values in the route path (e.g., /user/:id), while req.query captures values after the '?' in the URL."
  },
  {
    id: 8,
    question: "How do you handle errors in Express?",
    options: [
      "By using try...catch only",
      "By using an error-handling middleware with four parameters (err, req, res, next)",
      "By using res.error()",
      "By stopping the server manually"
    ],
    answer: "By using an error-handling middleware with four parameters (err, req, res, next)",
    explanation: "Express recognizes error-handling middleware by its four parameters, allowing you to manage and respond to errors globally."
  },
  {
    id: 9,
    question: "What is the purpose of express.Router()?",
    options: [
      "To manage database connections",
      "To create modular and mountable route handlers",
      "To handle frontend rendering",
      "To start the Express server"
    ],
    answer: "To create modular and mountable route handlers",
    explanation: "express.Router() allows grouping related routes into separate files or modules, improving project structure and maintainability."
  },
  {
    id: 10,
    question: "How do you serve static files in Express?",
    options: [
      "Using express.static() middleware",
      "By writing custom file readers",
      "By placing files in the 'public' folder automatically",
      "By using app.serveFiles()"
    ],
    answer: "Using express.static() middleware",
    explanation: "Static files such as images, CSS, and JS can be served using app.use(express.static('public')) in Express."
  }
];
export const mongodbTestQuestions = [
  {
    id: 1,
    question: "What type of database is MongoDB?",
    options: [
      "A relational database",
      "A NoSQL document-oriented database",
      "A graph database",
      "A key-value store only"
    ],
    answer: "A NoSQL document-oriented database",
    explanation: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents instead of tables and rows used in relational databases."
  },
  {
    id: 2,
    question: "What is a collection in MongoDB?",
    options: [
      "A group of tables",
      "A group of related documents stored together",
      "A single document",
      "A MongoDB query"
    ],
    answer: "A group of related documents stored together",
    explanation: "A collection in MongoDB is similar to a table in SQL — it stores multiple JSON-like documents that share a similar structure."
  },
  {
    id: 3,
    question: "What command is used to insert a document?",
    options: [
      "db.collection.add()",
      "db.collection.insertOne() or db.collection.insertMany()",
      "db.collection.create()",
      "db.collection.save()"
    ],
    answer: "db.collection.insertOne() or db.collection.insertMany()",
    explanation: "MongoDB uses insertOne() to add a single document and insertMany() to add multiple documents to a collection."
  },
  {
    id: 4,
    question: "What is the difference between find() and findOne()?",
    options: [
      "find() returns one document, findOne() returns multiple documents",
      "find() returns all matching documents, findOne() returns only the first match",
      "Both return all documents",
      "findOne() is faster but less accurate"
    ],
    answer: "find() returns all matching documents, findOne() returns only the first match",
    explanation: "The find() method returns a cursor containing all matched documents, while findOne() returns just a single document that matches the query."
  },
  {
    id: 5,
    question: "What is ObjectId in MongoDB?",
    options: [
      "A primary key for each collection",
      "A unique identifier automatically assigned to each document",
      "A function used for encryption",
      "A reference to a schema"
    ],
    answer: "A unique identifier automatically assigned to each document",
    explanation: "ObjectId is a 12-byte unique identifier automatically created for each document in MongoDB to ensure uniqueness across collections."
  },
  {
    id: 6,
    question: "How do you update multiple documents at once?",
    options: [
      "Using db.collection.updateMany()",
      "Using db.collection.updateAll()",
      "Using db.collection.changeMany()",
      "Using db.collection.updateOne()"
    ],
    answer: "Using db.collection.updateMany()",
    explanation: "The updateMany() method in MongoDB updates all documents that match the specified filter criteria."
  },
  {
    id: 7,
    question: "What is Mongoose and why is it used?",
    options: [
      "A MongoDB alternative database",
      "An ODM library that simplifies MongoDB interactions in Node.js",
      "A tool for indexing MongoDB collections",
      "A CLI tool for database migration"
    ],
    answer: "An ODM library that simplifies MongoDB interactions in Node.js",
    explanation: "Mongoose is an Object Data Modeling (ODM) library that provides schema-based data validation and an easier syntax for MongoDB operations in Node.js."
  },
  {
    id: 8,
    question: "What is the difference between referencing and embedding documents?",
    options: [
      "Referencing stores related data in separate collections, embedding stores it inside the same document",
      "Embedding is slower than referencing",
      "Referencing duplicates data, embedding avoids it",
      "They are identical approaches"
    ],
    answer: "Referencing stores related data in separate collections, embedding stores it inside the same document",
    explanation: "Referencing uses document IDs to link related collections (normalized), while embedding keeps related data inside one document (denormalized)."
  },
  {
    id: 9,
    question: "What does the $match operator do in aggregation?",
    options: [
      "Filters documents based on conditions before processing the next stage",
      "Joins two collections together",
      "Groups documents by field values",
      "Sorts documents by a specific field"
    ],
    answer: "Filters documents based on conditions before processing the next stage",
    explanation: "The $match stage in MongoDB aggregation filters documents by specified criteria, similar to a WHERE clause in SQL."
  },
  {
    id: 10,
    question: "How do you connect MongoDB to a Node.js app?",
    options: [
      "By using the mongoose.connect() or MongoClient.connect() method",
      "By writing SQL queries in the Node.js code",
      "By installing express only",
      "By using a frontend form connection"
    ],
    answer: "By using the mongoose.connect() or MongoClient.connect() method",
    explanation: "You can connect MongoDB to Node.js using the official MongoDB driver or Mongoose, e.g., mongoose.connect('mongodb://localhost:27017/dbname')."
  }
];
export const redisTestQuestions = [
  {
    id: 1,
    question: "What is Redis and what makes it different from MongoDB?",
    options: [
      "Redis is a relational database like MySQL",
      "Redis stores data in memory, while MongoDB stores data on disk",
      "Redis is used only for logging",
      "Redis and MongoDB are identical"
    ],
    answer: "Redis stores data in memory, while MongoDB stores data on disk",
    explanation: "Redis is an in-memory key-value data store, designed for high-speed operations, while MongoDB is a disk-based NoSQL database used for persistence."
  },
  {
    id: 2,
    question: "What does it mean that Redis stores data in memory?",
    options: [
      "Data is stored temporarily in RAM for faster access",
      "Data is permanently written to the disk",
      "Data cannot be retrieved after a restart",
      "Data is stored in the CPU cache"
    ],
    answer: "Data is stored temporarily in RAM for faster access",
    explanation: "Redis stores data in memory (RAM), allowing for extremely fast read and write operations compared to disk-based databases."
  },
  {
    id: 3,
    question: "Name three data types supported by Redis.",
    options: [
      "Strings, Hashes, Lists",
      "Tables, Documents, Schemas",
      "Rows, Columns, Tables",
      "Arrays, Objects, Functions"
    ],
    answer: "Strings, Hashes, Lists",
    explanation: "Redis supports multiple data types including Strings, Hashes, Lists, Sets, and Sorted Sets."
  },
  {
    id: 4,
    question: "What command is used to store a value in Redis?",
    options: [
      "SET key value",
      "ADD key value",
      "STORE key value",
      "INSERT key value"
    ],
    answer: "SET key value",
    explanation: "The SET command is used to store a value in Redis, e.g., SET user:1 'John'."
  },
  {
    id: 5,
    question: "How do you set an expiration time for a key?",
    options: [
      "Using the EXPIRE command",
      "Using the DELETE command",
      "Using the SETTIME command",
      "Using the CLEAR command"
    ],
    answer: "Using the EXPIRE command",
    explanation: "Redis provides the EXPIRE key seconds command to set a time-to-live (TTL) for a key."
  },
  {
    id: 6,
    question: "What is the purpose of Redis in caching?",
    options: [
      "To permanently store large datasets",
      "To temporarily store frequently accessed data for faster retrieval",
      "To replace SQL queries",
      "To serve as a file system"
    ],
    answer: "To temporarily store frequently accessed data for faster retrieval",
    explanation: "Redis is widely used as a cache to store frequently used data in memory, reducing the load on primary databases and improving performance."
  },
  {
    id: 7,
    question: "How can Redis be used for session storage?",
    options: [
      "By storing user sessions as key-value pairs in Redis",
      "By saving sessions in a file system",
      "By using SQL tables for sessions",
      "By encoding sessions in JWT tokens only"
    ],
    answer: "By storing user sessions as key-value pairs in Redis",
    explanation: "Redis can store session data in memory as key-value pairs, allowing quick retrieval during user authentication."
  },
  {
    id: 8,
    question: "What is a Redis hash used for?",
    options: [
      "To store multiple field-value pairs under one key",
      "To perform mathematical hashing",
      "To encrypt data",
      "To create search indexes"
    ],
    answer: "To store multiple field-value pairs under one key",
    explanation: "A Redis hash stores multiple field-value pairs under one key, making it ideal for representing objects like user profiles."
  },
  {
    id: 9,
    question: "How do you connect Redis with Node.js?",
    options: [
      "By using libraries like ioredis or redis package",
      "By writing SQL commands in Node.js",
      "By connecting through MongoDB",
      "By using the fetch() function"
    ],
    answer: "By using libraries like ioredis or redis package",
    explanation: "In Node.js, you can connect to Redis using libraries such as redis or ioredis, e.g., const client = redis.createClient();"
  },
  {
    id: 10,
    question: "What are common use cases of Redis in web apps?",
    options: [
      "Caching, session storage, message queues, and real-time analytics",
      "Storing static HTML files only",
      "Running SQL joins",
      "Hosting front-end assets"
    ],
    answer: "Caching, session storage, message queues, and real-time analytics",
    explanation: "Redis is commonly used for caching, storing sessions, handling message queues (Pub/Sub), and real-time analytics in web applications."
  }
];
