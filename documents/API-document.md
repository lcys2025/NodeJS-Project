## Authentication API

### Register a New User

- URL: `/auth/register`

- Method: `POST`

- Description: Creates a new user account with hashed password

- Request Body

  ```json
  {
    "username": "string",
    "password": "string",
    "name": "string",
    "email": "string"
  }
  ```

- Success Response

  - Code: 201 CREATED

  - Content

    ```json
    {
      "success": true,
      "data": {
        "id": "ObjectId",
        "username": "string",
        "name": "string",
        "email": "string"
      },
      "message": "User registered successfully",
      "statusCode": 201
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing required fields
    - Validation errors
  - Code: 409 Conflict
    - Username or email already exists
  - Code: 500 Internal Server Error
    - Database or server errors

### User Login

- URL: `/auth/login`

- Method: `POST`

- Description: Authenticates user credentials and returns user data

- Request Body

  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- Success Response

  - Code: 200 OK

  - Content

    ```json
    {
      "success": true,
      "data": {
        "id": "ObjectId",
        "username": "string",
        "name": "string",
        "email": "string"
      },
      "message": "Login successful",
      "statusCode": 200
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing username or password
  - Code: 401 Unauthorized
    - Invalid username or password
  - Code: 500 Internal Server Error
    - Database or server errors

## User Management API

### Get All Users

- URL: `/users`

- Method: `GET`

- Description: Retrieves a list of all users

- Success Response

  - Code: 200 OK

  - Content

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "ObjectId",
          "username": "string",
          "name": "string",
          "email": "string",
          "createdAt": "date",
          "updatedAt": "date"
        }
      ],
      "message": "Users retrieved successfully",
      "statusCode": 200
    }
    ```

- Error Responses

  - Code: 500 Internal Server Error
    - Database or server errors

### Get User by Username

- URL: `/users/:username`

- Method: `GET`

- Description: Retrieves a specific user by username

- URL Parameters

  - `username` (string)

- Success Response

  - Code: 200 OK

  - Content

    ```json
    {
      "success": true,
      "data": {
        "id": "ObjectId",
        "username": "string",
        "name": "string",
        "email": "string"
      },
      "message": "User retrieved successfully",
      "statusCode": 200
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing username parameter
  - Code: 404 Not Found
    - User not found
  - Code: 500 Internal Server Error
    - Database or server errors

### Create User

- URL: `/users`

- Method: `POST`

- Description: Creates a new user (alternative to registration)

- Request Body

  ```json
  {
    "username": "string",
    "password": "string",
    "name": "string",
    "email": "string"
  }
  ```

- Success Response

  - Code: 201 CREATED

  - Content

    ```json
    {
      "success": true,
      "data": {
        "id": "ObjectId",
        "username": "string",
        "name": "string",
        "email": "string"
      },
      "message": "User created successfully",
      "statusCode": 201
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing required fields
  - Code: 500 Internal Server Error
    - Database or server errors

### Update User

- URL: `/users/:username`

- Method: `PUT`

- Description: Updates an existing user's information

- URL Parameters

  - `username` (string, required)

- Request Body

  ```json
  {
    "name": "string",
    "email": "string"
  }
  ```

- Success Response

  - Code: 200 OK

  - Content

    ```json
    {
      "success": true,
      "data": {
        "id": "ObjectId",
        "username": "string",
        "name": "string",
        "email": "string"
      },
      "message": "User updated successfully",
      "statusCode": 200
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing username parameter
    - Empty update data
  - Code: 404 Not Found
    - User not found
  - Code: 500 Internal Server Error
    - Database or server errors

### Delete User

- URL: `/users/:username`

- Method: `DELETE`

- Description: Deletes a user by username

- URL Parameters

  - `username` (string)

- Success Response

  - Code: 200 OK

  - Content

    ```json
    {
      "success": true,
      "data": "username",
      "message": "User deleted successfully",
      "statusCode": 200
    }
    ```

- Error Responses

  - Code: 400 Bad Request
    - Missing username parameter
  - Code: 404 Not Found
    - User not found
  - Code: 500 Internal Server Error
    - Database or server errors

## HTTP Status Codes

The API uses the following HTTP status codes:

- **200 OK**: Successful GET, PUT, or DELETE requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Invalid request data or missing required fields
- **401 Unauthorized**: Invalid authentication credentials
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource or conflicting data
- **500 Internal Server Error**: Server-side errors