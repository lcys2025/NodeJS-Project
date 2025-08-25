## Project Structure

```
.
├── controller/              # Controllers handling business logic
│   ├── auth.controller.js   # Authentication operations (register, login)
│   └── user.controller.js   # User management operations (CRUD)
├── database/                # Database initialization scripts
│   └── init-data.js         # MongoDB data initialization
├── models/                  # Data models
│   └── User.model.js        # User schema and model
├── public/                  # Static assets
│   └── stylesheets/
│       └── style.css
├── routes/                  # API route definitions
│   ├── auth.route.js        # Authentication routes
│   ├── index.js             # Main routes
│   └── user.route.js        # User management routes
├── utils/                   # Utility functions
│   ├── responseHandler.js   # Standardized API response formats
│   └── statusCodes.js       # HTTP status codes constants
├── app.js                   # Main application entry point
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Key Component

1. **Controllers**: Handle business logic for authentication and user management
2. **Models**: Define data schemas using Mongoose ODM
3. **Routes**: Define API endpoints and map them to controller methods
4. **Utils**: Provide standardized responses and HTTP status codes
5. **Database**: MongoDB with Mongoose for data persistence